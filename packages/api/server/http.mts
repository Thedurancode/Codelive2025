import Path from 'node:path';
import { posthog } from '../posthog-client.mjs';
import fs from 'node:fs/promises';
import { SRCBOOKS_DIR } from '../constants.mjs';
import express, { type Application, type Response } from 'express';
import cors from 'cors';
import {
  createSession,
  findSession,
  deleteSessionByDirname,
  updateSession,
  sessionToResponse,
  listSessions,
  exportSrcmdText,
} from '../session.mjs';
import { generateCells, generateSrcbook, healthcheck, streamEditApp } from '../ai/generate.mjs';
import { streamParsePlan } from '../ai/plan-parser.mjs';
import {
  getConfig,
  updateConfig,
  getSecrets,
  addSecret,
  getHistory,
  appendToHistory,
  removeSecret,
  associateSecretWithSession,
  disassociateSecretWithSession,
} from '../config.mjs';
import {
  createSrcbook,
  removeSrcbook,
  importSrcbookFromSrcmdFile,
  importSrcbookFromSrcmdText,
  importSrcbookFromSrcmdUrl,
  updateSessionEnvTypeDeclarations,
} from '../srcbook/index.mjs';
import { readdir } from '../fs-utils.mjs';
import { EXAMPLE_SRCBOOKS } from '../srcbook/examples.mjs';
import { pathToSrcbook } from '../srcbook/path.mjs';
import { isSrcmdPath } from '../srcmd/paths.mjs';
import {
  loadApps,
  loadApp,
  createApp,
  serializeApp,
  deleteApp,
  createAppWithAi,
  updateApp,
} from '../apps/app.mjs';
import { toValidPackageName } from '../apps/utils.mjs';
import {
  deleteFile,
  renameFile,
  loadDirectory,
  loadFile,
  createFile,
  createDirectory,
  renameDirectory,
  deleteDirectory,
  getFlatFilesForApp,
} from '../apps/disk.mjs';
import { CreateAppSchema } from '../apps/schemas.mjs';
import { AppGenerationFeedbackType, randomid } from '@srcbook/shared';
import { createZipFromApp } from '../apps/disk.mjs';
import { checkoutCommit, commitAllFiles, getCurrentCommitSha } from '../apps/git.mjs';
import { streamJsonResponse } from './utils.mjs';
import swaggerRouter from './swagger.mjs';
import { ESLint } from 'eslint';
import { minimatch } from 'minimatch';
import type { FileContent } from '../ai/app-parser.mjs';
import type { App as DBAppType } from '../db/schema.mjs';
import { deployToModal } from '../apps/deployment/modal.mjs';
import { createPreview, getPreview, deletePreview } from '../apps/preview.mjs';
import { executeCode, uploadFile, downloadFile } from '../ai/code-executor.mjs';
import { createSandbox, getSandbox, deleteSandbox } from '../apps/sandbox.mjs';

const app: Application = express();

const router = express.Router();

router.use(express.json());

// Mount Swagger UI
router.use('/docs', swaggerRouter);

router.options('/file', cors());

router.post('/file', cors(), async (req, res) => {
  const { file } = req.body as {
    file: string;
  };

  try {
    const content = await fs.readFile(file, 'utf8');
    const cell = file.includes('.srcbook/srcbooks') && !file.includes('node_modules');
    const filename = cell ? file.split('/').pop() || file : file;

    return res.json({
      error: false,
      result: {
        content: cell ? '' : content,
        filename,
        type: cell ? 'cell' : 'filepath',
      },
    });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

router.options('/examples', cors());
router.get('/examples', cors(), (_, res) => {
  return res.json({ result: EXAMPLE_SRCBOOKS });
});

// Create a new srcbook
router.options('/srcbooks', cors());
router.post('/srcbooks', cors(), async (req, res) => {
  const { name, language } = req.body;

  // TODO: Zod
  if (typeof name !== 'string' || name.length < 1 || name.length > 44 || name.trim() === '') {
    return res.json({
      error: true,
      result: 'Srcbook is required and cannot be more than 44 characters',
    });
  }

  posthog.capture({
    event: 'user created srcbook',
    properties: { language },
  });

  try {
    const srcbookDir = await createSrcbook(name, language);
    return res.json({ error: false, result: { name, path: srcbookDir } });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

router.options('/srcbooks/:id', cors());
router.delete('/srcbooks/:id', cors(), async (req, res) => {
  const { id } = req.params;
  const srcbookDir = pathToSrcbook(id);
  removeSrcbook(srcbookDir);
  posthog.capture({ event: 'user deleted srcbook' });
  await deleteSessionByDirname(srcbookDir);
  return res.json({ error: false, deleted: true });
});

// Import a srcbook from a .src.md file or srcmd text.
router.options('/import', cors());
router.post('/import', cors(), async (req, res) => {
  const { path, text, url } = req.body;

  if (typeof path === 'string' && !isSrcmdPath(path)) {
    return res.json({ error: true, result: 'Importing only works with .src.md files' });
  }

  try {
    if (typeof path === 'string') {
      posthog.capture({ event: 'user imported srcbook from file' });
      const srcbookDir = await importSrcbookFromSrcmdFile(path);
      return res.json({ error: false, result: { dir: srcbookDir } });
    } else if (typeof url === 'string') {
      posthog.capture({ event: 'user imported srcbook from url' });
      const srcbookDir = await importSrcbookFromSrcmdUrl(url);
      return res.json({ error: false, result: { dir: srcbookDir } });
    } else {
      posthog.capture({ event: 'user imported srcbook from text' });
      const srcbookDir = await importSrcbookFromSrcmdText(text);
      return res.json({ error: false, result: { dir: srcbookDir } });
    }
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

// Generate a srcbook using AI from a simple string query
router.options('/generate', cors());
router.post('/generate', cors(), async (req, res) => {
  const { query } = req.body;

  try {
    posthog.capture({ event: 'user generated srcbook with AI', properties: { query } });
    const result = await generateSrcbook(query);
    const srcbookDir = await importSrcbookFromSrcmdText(result.text);
    return res.json({ error: false, result: { dir: srcbookDir } });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

// Generate a cell using AI from a query string
router.options('/sessions/:id/generate_cells', cors());
router.post('/sessions/:id/generate_cells', cors(), async (req, res) => {
  // @TODO: zod
  const { insertIdx, query } = req.body;

  try {
    posthog.capture({ event: 'user generated cell with AI', properties: { query } });
    const session = await findSession(req.params.id);
    const { error, errors, cells } = await generateCells(query, session, insertIdx);
    const result = error ? errors : cells;
    return res.json({ error, result });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

// Test that the AI generation is working with the current configuration
router.options('/ai/healthcheck', cors());
router.get('/ai/healthcheck', cors(), async (_req, res) => {
  try {
    const result = await healthcheck();
    return res.json({ error: false, result });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

// Open an existing srcbook by passing a path to the srcbook's directory
router.options('/sessions', cors());
router.post('/sessions', cors(), async (req, res) => {
  const { path } = req.body;

  posthog.capture({ event: 'user opened srcbook' });
  const dir = await readdir(path);

  if (!dir.exists) {
    return res.json({ error: true, result: `${path} is not a srcbook directory` });
  }

  try {
    const session = await createSession(path);
    return res.json({ error: false, result: sessionToResponse(session) });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

router.get('/sessions', cors(), async (_req, res) => {
  const sessions = await listSessions();
  return res.json({ error: false, result: Object.values(sessions).map(sessionToResponse) });
});

router.options('/sessions/:id', cors());

router.get('/sessions/:id', cors(), async (req, res) => {
  const { id } = req.params;

  try {
    let session = await findSession(id);

    if (!session) {
      // This might be after a server restart, so we should try
      // to see if we have a directory for this sessionId.
      const exists = await fs.stat(Path.join(SRCBOOKS_DIR, id));
      if (exists) {
        session = await createSession(Path.join(SRCBOOKS_DIR, id));
      }
    }
    updateSession(session, { openedAt: Date.now() }, false);
    return res.json({ error: false, result: sessionToResponse(session) });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

router.options('/sessions/:id/export-text', cors());
router.get('/sessions/:id/export-text', cors(), async (req, res) => {
  const session = await findSession(req.params.id);

  posthog.capture({ event: 'user exported srcbook' });

  try {
    const text = exportSrcmdText(session);
    res.setHeader('Content-Type', 'text/markdown');
    res.send(text).end();
    return;
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

router.options('/sessions/:id/secrets/:name', cors());
router.put('/sessions/:id/secrets/:name', cors(), async (req, res) => {
  const { id, name } = req.params;
  await associateSecretWithSession(name, id);
  await updateSessionEnvTypeDeclarations(id);
  return res.status(204).end();
});

router.delete('/sessions/:id/secrets/:name', cors(), async (req, res) => {
  const { id, name } = req.params;
  await disassociateSecretWithSession(name, id);
  await updateSessionEnvTypeDeclarations(id);
  return res.status(204).end();
});

router.options('/settings', cors());

router.get('/settings', cors(), async (_req, res) => {
  const config = await getConfig();
  return res.json({ error: false, result: config });
});

router.post('/settings', cors(), async (req, res) => {
  try {
    const updated = await updateConfig(req.body);

    posthog.capture({
      event: 'user updated settings',
      properties: { setting_changed: Object.keys(req.body) },
    });

    return res.json({ result: updated });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, message: error.stack });
  }
});

router.options('/secrets', cors());

router.get('/secrets', cors(), async (_req, res) => {
  const secrets = await getSecrets();
  return res.json({ result: secrets });
});

// Create a new secret
router.post('/secrets', cors(), async (req, res) => {
  const { name, value } = req.body;
  posthog.capture({ event: 'user created secret' });
  const updated = await addSecret(name, value);
  return res.json({ result: updated });
});

router.options('/secrets/:name', cors());

router.post('/secrets/:name', cors(), async (req, res) => {
  const { name } = req.params;
  const { name: newName, value } = req.body;
  await removeSecret(name);
  const updated = await addSecret(newName, value);
  return res.json({ result: updated });
});

router.delete('/secrets/:name', cors(), async (req, res) => {
  const { name } = req.params;
  const updated = await removeSecret(name);
  return res.json({ result: updated });
});

router.options('/feedback', cors());
router.post('/feedback', cors(), async (req, res) => {
  const { feedback, email } = req.body;
  // Every time you modify the appscript here, you'll need to update the URL below
  // @TODO: once we have an env variable setup, we can use that here.
  const url =
    'https://script.google.com/macros/s/AKfycbxPrg8z47SkJnHyoZBYqNtkcH8hBe12f-f2UJJ3PcIHmKdbMMuJuPoOemEB1ib8a_IKCg/exec';

  const result = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ feedback, email }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });

  return res.json({ success: result.ok });
});

type NpmSearchResult = {
  package: {
    name: string;
    version: string;
    description: string;
  };
};

/*
 * Search for npm packages for a given query.
 * Returns the name, version and description of the packages.
 * Consider debouncing calls to this API on the client side.
 */
router.options('/npm/search', cors());
router.get('/npm/search', cors(), async (req, res) => {
  const { q, size } = req.query;
  const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${q}&size=${size}`);
  if (!response.ok) {
    return res.json({ error: true, result: [] });
  }
  const packages = await response.json();
  const results = packages.objects.map((o: NpmSearchResult) => {
    return { name: o.package.name, version: o.package.version, description: o.package.description };
  });
  return res.json({ result: results });
});

router.options('/subscribe', cors());
router.post('/subscribe', cors(), async (req, res) => {
  const { email } = req.body;
  const hubResponse = await fetch('https://hub.srcbook.com/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (hubResponse.ok) {
    return res.json({ success: true });
  } else {
    return res.status(hubResponse.status).json({ success: false });
  }
});

function error500(res: Response, e: Error) {
  const error = e as unknown as Error;
  console.error(error);
  return res.status(500).json({ error: 'An unexpected error occurred.' });
}

router.options('/apps', cors());
router.post('/apps', cors(), async (req, res) => {
  const result = CreateAppSchema.safeParse(req.body);

  if (result.success === false) {
    const errors = result.error.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  const attrs = result.data;

  posthog.capture({
    event: 'user created app',
    properties: { prompt: typeof attrs.prompt === 'string' ? attrs.prompt : 'N/A' },
  });

  try {
    if (typeof attrs.prompt === 'string') {
      const app = await createAppWithAi({ name: attrs.name, prompt: attrs.prompt });
      return res.json({ data: serializeApp(app) });
    } else {
      // TODO do we really need to keep this?
      const app = await createApp(attrs);
      return res.json({ data: serializeApp(app) });
    }
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps', cors());
router.get('/apps', cors(), async (req, res) => {
  const sort = req.query.sort === 'desc' ? 'desc' : 'asc';

  try {
    const apps = await loadApps(sort);
    return res.json({ data: apps.map(serializeApp) });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id', cors());
router.get('/apps/:id', cors(), async (req, res) => {
  const { id } = req.params;

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    return res.json({ data: serializeApp(app) });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id', cors());
router.put('/apps/:id', cors(), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const app = await updateApp(id, { name });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    return res.json({ data: serializeApp(app) });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id', cors());
router.delete('/apps/:id', cors(), async (req, res) => {
  const { id } = req.params;

  try {
    await deleteApp(id);
    return res.json({ deleted: true });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/directories', cors());
router.get('/apps/:id/directories', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const path = typeof req.query.path === 'string' ? req.query.path : '.';

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const directory = await loadDirectory(app, path);

    return res.json({ data: directory });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/edit', cors());
router.post('/apps/:id/edit', cors(), async (req, res) => {
  const { id } = req.params;
  const { query, planId } = req.body;
  posthog.capture({ event: 'user edited app with ai' });
  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    const validName = toValidPackageName(app.name);
    const files = await getFlatFilesForApp(String(app.externalId));
    const result = await streamEditApp(validName, files, query, app.externalId, planId);
    const planStream = await streamParsePlan(result, app, query, planId);

    return streamJsonResponse(planStream, res, { status: 200 });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/commit', cors());
router.get('/apps/:id/commit', cors(), async (req, res) => {
  const { id } = req.params;
  const app = await loadApp(id);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  const sha = await getCurrentCommitSha(app);
  return res.json({ sha });
});
router.post('/apps/:id/commit', cors(), async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  // import the commit function from the apps/git.mjs file
  const app = await loadApp(id);

  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  const sha = await commitAllFiles(app, message);
  return res.json({ sha });
});

router.options('/apps/:id/checkout/:sha', cors());
router.post('/apps/:id/checkout/:sha', cors(), async (req, res) => {
  const { id, sha } = req.params;
  const app = await loadApp(id);

  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  await checkoutCommit(app, sha);
  return res.json({ success: true, sha });
});

router.options('/apps/:id/directories', cors());
router.post('/apps/:id/directories', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const { dirname, basename } = req.body;

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const directory = await createDirectory(app, dirname, basename);

    return res.json({ data: directory });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/directories', cors());
router.delete('/apps/:id/directories', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const path = typeof req.query.path === 'string' ? req.query.path : '.';

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    await deleteDirectory(app, path);

    return res.json({ data: { deleted: true } });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/directories/rename', cors());
router.post('/apps/:id/directories/rename', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const path = typeof req.query.path === 'string' ? req.query.path : '.';
  const name = req.query.name as string;

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const directory = await renameDirectory(app, path, name);

    return res.json({ data: directory });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/files', cors());
router.get('/apps/:id/files', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const path = typeof req.query.path === 'string' ? req.query.path : '.';

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const file = await loadFile(app, path);

    return res.json({ data: file });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/files', cors());
router.post('/apps/:id/files', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const { dirname, basename, source } = req.body;

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const file = await createFile(app, dirname, basename, source);

    return res.json({ data: file });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/files', cors());
router.delete('/apps/:id/files', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const path = typeof req.query.path === 'string' ? req.query.path : '.';

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    await deleteFile(app, path);

    return res.json({ data: { deleted: true } });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/files/rename', cors());
router.post('/apps/:id/files/rename', cors(), async (req, res) => {
  const { id } = req.params;

  // TODO: validate and ensure path is not absolute
  const path = typeof req.query.path === 'string' ? req.query.path : '.';
  const name = req.query.name as string;

  try {
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const file = await renameFile(app, path, name);

    return res.json({ data: file });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/export', cors());
router.post('/apps/:id/export', cors(), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    posthog.capture({ event: 'user exported app' });
    const app = await loadApp(id);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const zipBuffer = await createZipFromApp(app);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.zip"`);
    res.send(zipBuffer);
  } catch (e) {
    return error500(res, e as Error);
  }
});

app.use('/api', router);

export default app;

router.options('/apps/:id/history', cors());
router.get('/apps/:id/history', cors(), async (req, res) => {
  const { id } = req.params;
  const history = await getHistory(id);
  return res.json({ data: history });
});

router.post('/apps/:id/history', cors(), async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;
  await appendToHistory(id, messages);
  return res.json({ data: { success: true } });
});

router.options('/apps/:id/feedback', cors());
router.post('/apps/:id/feedback', cors(), async (req, res) => {
  const { id } = req.params;
  const { planId, feedback } = req.body as AppGenerationFeedbackType;

  if (process.env.SRCBOOK_DISABLE_ANALYTICS === 'true') {
    return res.status(403).json({ error: 'Analytics are disabled' });
  }
  posthog.capture({ event: 'user sent feedback', properties: { type: feedback.type } });

  try {
    const response = await fetch('https://hub.srcbook.com/api/app_generation_feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: id,
        planId,
        feedback,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return res.json(result);
  } catch (error) {
    console.error('Error sending feedback:', error);
    return res.status(500).json({ error: 'Failed to send feedback' });
  }
});

router.options('/apps/:id/prompt', cors());
router.post('/apps/:id/prompt', cors(), async (req, res) => {
  const { id } = req.params;
  const { query } = req.body;

  console.log(`[Prompt API] Received request for app ${id} with query: ${query}`);

  if (typeof query !== 'string' || query.trim() === '') {
    console.log('[Prompt API] Error: Empty or invalid query');
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const app = await loadApp(id);

    if (!app) {
      console.log(`[Prompt API] Error: App ${id} not found`);
      return res.status(404).json({ error: 'App not found' });
    }

    console.log(`[Prompt API] Processing changes for app: ${app.name} (${app.externalId})`);
    posthog.capture({ event: 'user prompted app with ai', properties: { query } });
    
    const validName = toValidPackageName(app.name);
    console.log(`[Prompt API] Getting files for app ${validName}`);
    const files = await getFlatFilesForApp(String(app.externalId));
    console.log(`[Prompt API] Found ${files.length} files to process`);

    const planId = randomid();
    console.log(`[Prompt API] Generated plan ID: ${planId}`);

    console.log(`[Prompt API] Streaming edit changes...`);
    const result = await streamEditApp(validName, files, query, app.externalId, planId);
    
    console.log(`[Prompt API] Parsing plan...`);
    const planStream = await streamParsePlan(result, app, query, planId);

    console.log(`[Prompt API] Sending response stream...`);
    return streamJsonResponse(planStream, res, { status: 200 });
  } catch (e) {
    const error = e as Error;
    console.error('[Prompt API] Error processing request:', error);
    console.error(error.stack);
    return error500(res, e as Error);
  }
});

interface SearchResult {
  file: string;
  line: number;
  content: string;
}

interface FileStats {
  fileCount: number;
  totalSize: number;
  lastModified: string;
  fileTypes: Record<string, number>;
}

interface LintIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

router.options('/apps/:id/search', cors());
router.post('/apps/:id/search', cors(), async (req, res) => {
  const { id } = req.params;
  const { query, filePattern } = req.body;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const files = await getFlatFilesForApp(String(app.externalId));
    const results: SearchResult[] = [];

    for (const file of files) {
      if (filePattern && !minimatch(file.filename, filePattern, { matchBase: true })) {
        continue;
      }

      const content = file.content;
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            file: file.filename,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }

    return res.json({ data: results });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/dependencies', cors());
router.get('/apps/:id/dependencies', cors(), async (req, res) => {
  const { id } = req.params;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const files = await getFlatFilesForApp(String(app.externalId));
    const packageJson = files.find(f => f.filename === 'package.json');
    
    if (!packageJson) {
      return res.json({
        dependencies: {},
        devDependencies: {}
      });
    }

    const parsed = JSON.parse(packageJson.content);
    return res.json({
      dependencies: parsed.dependencies || {},
      devDependencies: parsed.devDependencies || {}
    });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.post('/apps/:id/dependencies', cors(), async (req, res) => {
  const { id } = req.params;
  const { dependencies, dev } = req.body;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const files = await getFlatFilesForApp(String(app.externalId));
    const packageJson = files.find(f => f.filename === 'package.json');
    
    if (!packageJson) {
      return res.status(404).json({ error: 'package.json not found' });
    }

    const parsed = JSON.parse(packageJson.content);
    const targetField = dev ? 'devDependencies' : 'dependencies';
    parsed[targetField] = { ...parsed[targetField], ...dependencies };

    await createFile(app, '.', 'package.json', JSON.stringify(parsed, null, 2));
    return res.json({ success: true });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/stats', cors());
router.get('/apps/:id/stats', cors(), async (req, res) => {
  const { id } = req.params;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const files = await getFlatFilesForApp(String(app.externalId));
    let totalSize = 0;
    const fileTypes: Record<string, number> = {};

    for (const file of files) {
      totalSize += Buffer.byteLength(file.content, 'utf8');
      const ext = Path.extname(file.filename).toLowerCase();
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }

    const stats: FileStats = {
      fileCount: files.length,
      totalSize,
      lastModified: new Date().toISOString(),
      fileTypes
    };

    return res.json(stats);
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/lint', cors());
router.post('/apps/:id/lint', cors(), async (req, res) => {
  const { id } = req.params;
  const { fix = false, paths = [] } = req.body;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Create ESLint instance with minimal configuration
    const eslint = new ESLint({ fix });

    const files = await getFlatFilesForApp(String(app.externalId));
    const filesToLint = paths.length > 0 
      ? paths.map((p: string) => files.find(f => f.filename === p)?.filename).filter(Boolean) as string[]
      : files.filter(f => f.filename.match(/\.(js|jsx|ts|tsx)$/)).map(f => f.filename);

    const results = await eslint.lintFiles(filesToLint);
    if (fix) {
      await ESLint.outputFixes(results);
    }

    const issues: LintIssue[] = results.flatMap(result => 
      result.messages.map(msg => ({
        file: Path.relative(app.externalId, result.filePath),
        line: msg.line,
        column: msg.column,
        message: msg.message,
        severity: msg.severity === 2 ? 'error' : 'warning'
      }))
    );

    return res.json({ issues });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/publish', cors());
router.post('/apps/:id/publish', cors(), async (req, res) => {
  const { id } = req.params;
  const { analytics = true, customDomain, password, cacheControl } = req.body;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Get current commit SHA
    const commit = await getCurrentCommitSha(app);

    // Generate a unique deployment ID
    const deploymentId = `dep_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;

    // Deploy using Modal
    const modalConfig = {
      token: process.env.MODAL_TOKEN || 'ak-ii2SSYFGmwipwOx4BMRS7s',
      projectId: app.externalId
    };

    console.log('Starting Modal deployment with config:', {
      ...modalConfig,
      token: '***' // Hide token in logs
    });

    const deployment = await deployToModal(app, modalConfig);

    if (!deployment.success) {
      console.error('Modal deployment failed:', deployment.error);
      return res.status(500).json({ error: deployment.error });
    }

    console.log('Modal deployment successful:', deployment);

    // Store deployment info in database
    const deploymentInfo = {
      id: deploymentId,
      url: deployment.url,
      status: 'deployed',
      commit,
      createdAt: new Date().toISOString(),
      config: {
        customDomain,
        hasPassword: !!password,
        cacheControl
      },
      analytics: {
        enabled: analytics,
        visits: 0,
        uniqueVisitors: 0,
        avgLoadTime: 0
      }
    };

    return res.json(deploymentInfo);
  } catch (e) {
    console.error('Deployment error:', e);
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/deployments', cors());
router.get('/apps/:id/deployments', cors(), async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // TODO: Get deployments from database
    // For now return mock data
    const mockDeployment = {
      id: 'dep_abc123',
      url: `https://${app.name}-${app.externalId.substring(0, 6)}.codelive.app`,
      status: 'deployed',
      commit: await getCurrentCommitSha(app),
      createdAt: new Date().toISOString(),
      analytics: {
        visits: 0,
        uniqueVisitors: 0
      }
    };

    return res.json({ deployments: [mockDeployment] });
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/deployments/:deploymentId', cors());
router.get('/apps/:id/deployments/:deploymentId', cors(), async (req, res) => {
  const { id, deploymentId } = req.params;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // TODO: Get deployment from database
    // For now return mock data
    const mockDeployment = {
      id: deploymentId,
      url: `https://${app.name}-${app.externalId.substring(0, 6)}.codelive.app`,
      status: 'deployed',
      commit: await getCurrentCommitSha(app),
      config: {
        customDomain: null,
        hasPassword: false,
        cacheControl: 'max-age=3600'
      },
      analytics: {
        visits: 0,
        uniqueVisitors: 0,
        avgLoadTime: 0
      },
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Deployment successful'
        }
      ]
    };

    return res.json(mockDeployment);
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.options('/apps/:id/preview-sandbox', cors());
router.post('/apps/:id/preview-sandbox', cors(), async (req, res) => {
  const { id } = req.params;
  const config = req.body;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    posthog.capture({ event: 'user created preview sandbox', properties: { appId: id } });
    const sandbox = await createSandbox(app, config);
    return res.json(sandbox);
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.get('/apps/:id/preview-sandbox/:sandboxId', cors(), async (req, res) => {
  const { id, sandboxId } = req.params;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const sandbox = await getSandbox(app, sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    return res.json(sandbox);
  } catch (e) {
    return error500(res, e as Error);
  }
});

router.delete('/apps/:id/preview-sandbox/:sandboxId', cors(), async (req, res) => {
  const { id, sandboxId } = req.params;

  try {
    const app = await loadApp(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const deleted = await deleteSandbox(app, sandboxId);
    if (!deleted) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    return res.json({ deleted: true, sandboxId });
  } catch (e) {
    return error500(res, e as Error);
  }
});

// Execute code in Python environment
router.options('/execute', cors());
router.post('/execute', cors(), async (req, res) => {
  const { code, files } = req.body;

  if (typeof code !== 'string') {
    return res.json({ error: true, result: 'Code must be a string' });
  }

  try {
    // Handle file uploads if provided
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (file && typeof file === 'object' && 'path' in file && 'content' in file && 
            typeof file.path === 'string' && (typeof file.content === 'string' || Buffer.isBuffer(file.content))) {
          await uploadFile(file.path, file.content);
        }
      }
    }

    posthog.capture({ event: 'user executed code', properties: { code } });
    const result = await executeCode(code);

    // Handle file downloads if requested in the code
    if (result.text.includes('FILE_DOWNLOAD:')) {
      const filePath = result.text.split('FILE_DOWNLOAD:')[1].trim();
      const fileContent = await downloadFile(filePath);
      return res.json({ 
        error: false, 
        result: {
          ...result,
          file: {
            path: filePath,
            content: fileContent.toString('base64')
          }
        }
      });
    }

    return res.json({ error: false, result });
  } catch (e) {
    const error = e as unknown as Error;
    console.error(error);
    return res.json({ error: true, result: error.stack });
  }
});

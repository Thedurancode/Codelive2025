import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { createPreview, getPreview, deletePreview } from './preview.mjs';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { randomid } from '@srcbook/shared';

// Mock dependencies
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

vi.mock('fs/promises', () => ({
  stat: vi.fn()
}));

vi.mock('@srcbook/shared', () => ({
  randomid: vi.fn()
}));

describe('Preview Module', () => {
  const mockApp = {
    id: 1,
    name: 'Test App',
    externalId: 'test123',
    history: '[]',
    historyVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (vi.mocked(exec) as Mock).mockImplementation((cmd, opts, callback) => {
      if (callback) {
        callback(null, { stdout: 'success', stderr: '' });
      }
      return Promise.resolve({ stdout: 'success', stderr: '' });
    });

    (fs.stat as Mock).mockResolvedValue({
      isDirectory: () => true
    });

    (randomid as Mock).mockReturnValue('xyz789');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPreview', () => {
    it('should create a preview with default config', async () => {
      const preview = await createPreview(mockApp);

      expect(preview).toMatchObject({
        previewId: 'prev_xyz789',
        e2bUrl: expect.stringContaining('preview-prev_xyz789'),
        status: 'ready',
        resources: {
          cpu: '1',
          memory: '1Gi'
        }
      });

      expect(exec).toHaveBeenCalledWith('npm install', expect.any(Object));
      expect(exec).toHaveBeenCalledWith('npm run dev', expect.any(Object));
    });

    it('should create a preview with custom config', async () => {
      const config = {
        port: 4000,
        ttl: 30,
        resourceLimits: {
          cpu: '2',
          memory: '2Gi'
        },
        env: {
          NODE_ENV: 'development'
        }
      };

      const preview = await createPreview(mockApp, config);

      expect(preview.resources).toMatchObject({
        cpu: '2',
        memory: '2Gi'
      });

      expect(exec).toHaveBeenCalledWith('npm install', {
        cwd: expect.any(String),
        env: expect.objectContaining({
          PORT: '4000',
          NODE_ENV: 'development'
        })
      });
    });

    it('should throw error if app directory does not exist', async () => {
      (fs.stat as Mock).mockResolvedValue({
        isDirectory: () => false
      });

      await expect(createPreview(mockApp)).rejects.toThrow();
    });
  });

  describe('getPreview', () => {
    it('should return null for non-existent preview', async () => {
      const preview = await getPreview(mockApp, 'non-existent');
      expect(preview).toBeNull();
    });

    it('should return preview info for existing preview', async () => {
      // First create a preview
      const created = await createPreview(mockApp);
      
      // Then get it
      const preview = await getPreview(mockApp, created.previewId);
      
      expect(preview).toMatchObject({
        previewId: created.previewId,
        status: 'ready'
      });
    });
  });

  describe('deletePreview', () => {
    it('should return false for non-existent preview', async () => {
      const result = await deletePreview(mockApp, 'non-existent');
      expect(result).toBe(false);
    });

    it('should successfully delete existing preview', async () => {
      // First create a preview
      const created = await createPreview(mockApp);
      
      // Then delete it
      const result = await deletePreview(mockApp, created.previewId);
      
      expect(result).toBe(true);
      expect(exec).toHaveBeenCalledWith('pkill -f "npm run dev"');
      
      // Verify it's gone
      const preview = await getPreview(mockApp, created.previewId);
      expect(preview).toBeNull();
    });
  });
}); 
import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

const router: Router = express.Router();

// Read and parse the OpenAPI/Swagger YAML file
const swaggerDocument = parse(
  readFileSync(join(__dirname, '../swagger.yaml'), 'utf8')
);

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

export default router; 
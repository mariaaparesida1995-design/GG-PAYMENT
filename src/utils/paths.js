import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const projectRoot = path.resolve(__dirname, '..', '..');
export const dataDir = path.join(projectRoot, 'src', 'data');

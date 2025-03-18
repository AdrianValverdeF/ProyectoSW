import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
    port: 3000,
    recursos: join(__dirname, 'static'),
    vistas: join(__dirname, 'vistas'),
    session: {
        resave: false,
        saveUninitialized: true,
        secret: 'no muy secreto'
    }
}
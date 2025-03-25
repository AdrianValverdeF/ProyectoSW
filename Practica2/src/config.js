import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const config = {
    port: parseInt(process.env.APP_PORT || 3000),
    host: process.env.APP_HOST || 'localhost',
    recursos: join(__dirname, '../static'),
    vistas: join(__dirname, '../vistas'), // Ajusta la ruta para apuntar al directorio correcto
    session: {
        resave: false,
        saveUninitialized: true,
        secret: 'no muy secreto'
    }
};
export const baseUrl = `http://${config.host}${config.port !== 80 ? `:${config.port}` : ''}`;
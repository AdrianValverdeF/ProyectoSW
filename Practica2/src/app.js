import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';

export const app = express();

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(express.urlencoded({ extended: false }));
app.use(session(config.session));

app.use('/', express.static(config.recursos));
app.get('/', (req, res) => {
    // Parámetros que estarán disponibles en la plantilla
    res.redirect('/contenido/foroComun');
})
app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);

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
    const params = {
        contenido: 'paginas/index', // fichero ejs que tiene el contenido específico para esta vista
        session: req.session // Neesario para (entre otras cosas) utilizarlo en mostrarSaludo de cabecera.ejs
    }
    res.render('pagina', params);
})
app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);

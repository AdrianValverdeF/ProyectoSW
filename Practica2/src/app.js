import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';
import { baseUrl } from './config.js';

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
app.use('/mensjaes',handlerMensajes);

function handlerMensajes(req, res) {
    const url = new URL(`${baseUrl}${req.url}`);
    console.log(url);
    res.end();
}

/*
contenidoRouter.get('/mensajes', (req, res) => {
    let contenido = 'paginas/foroComun';
    let resp = false;
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });
    if (req.session.login) {
        console.log(req.query);
        let id_mensaje_respuesta = req.query.id;
        resp = true;
    }  
    
    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios,
        respuesta: resp
    });

});*/
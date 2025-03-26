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

app.get('/mensajes', contenidoRouter);
/*
function handlerMensajes(req, res) {
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    // Aquí puedes agregar la lógica que necesites para manejar la solicitud
    // Por ejemplo, obtener mensajes y renderizar una vista
    let contenido = 'paginas/foroComun';
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });
    let resp = false;
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
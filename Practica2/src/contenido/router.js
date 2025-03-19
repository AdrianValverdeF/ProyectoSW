import express from 'express';
import { Mensajes } from './mensajes.js';
import { Usuario } from '../usuarios/Usuario.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/foroComun', (req, res) => {
    let contenido = 'paginas/foroComun';
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.post('/enviarmensaje', (req, res) => {
    const mensaje = req.body.mensaje;
    const id_usuario = Usuario.getIdByUsername(req.session.username); 
    const datas = new Date();
    const horaEnvio = datas.getHours() + ":" + datas.getMinutes();
    const created_at = horaEnvio;
    const id_mensaje_respuesta = null; 
    const id_foro = 1; 
    
    if (!mensaje || !id_usuario) {
        return res.status(400).send('Mensaje o usuario no válido');
    }

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
    } catch (e) {
        return res.status(500).send('Error al enviar el mensaje');
    }

    res.redirect('/contenido/foroComun');
});

contenidoRouter.get('/normal', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/normal';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/admin', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.esAdmin) {
        contenido = 'paginas/admin';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/amigosPag', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/amigos';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('paginaSinSidebar', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/gestion-apuestas', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/gestion-apuestas';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/gestion-eventos', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/gestion-eventos';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/perfil', (req, res) => {
    let contenido = 'paginas/perfil';
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/futbol11', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/futbol11';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/futbolSala', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/futbolSala';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/voleibol', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/voleibol';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/rugby', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/rugby';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/baloncesto', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/baloncesto';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

contenidoRouter.get('/amigos', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/amigos';
    }
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });

    res.render('paginaSinSidebar', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios
    });
});

export default contenidoRouter;



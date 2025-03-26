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
    let resp = false;
    res.render('pagina', {
        contenido,
        session: req.session,
        mensajes: mensajesConUsuarios,
        respuesta: resp
    });
});



contenidoRouter.get('/mensajes', (req,res) => {
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
    if (req.session.login) {;
        let id_mensaje_respuesta = url.searchParams.get('id');
        let mRespuesta = Mensajes.getMensajeById(id_mensaje_respuesta);
        let usuario = Usuario.getUsuarioById(mRespuesta.id_usuario);
        mRespuesta.username = usuario ? usuario.username : 'Usuario desconocido';
        resp = true;
        
        res.render('pagina', {
            contenido,
            session: req.session,
            mensajes: mensajesConUsuarios,
            respuesta: resp,
            mensajeRespuesta: mRespuesta
        });
    } else {
        res.redirect('/contenido/foroComun');
    }


});

contenidoRouter.post('/enviarmensaje', (req, res) => {
    if (req.session.login) {
        
        const mensaje = req.body.mensaje;
        const id_usuario = Usuario.getIdByUsername(req.session.username); 
        const datas = new Date();
        const horaEnvio = datas.getHours() + ":" + datas.getMinutes();
        const created_at = horaEnvio;
        console.log(req.body.id_respuesta);
        const id_mensaje_respuesta = req.body.id_respuesta;
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
    
    }
    res.redirect('/contenido/foroComun');
});

contenidoRouter.get('/normal', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/normal';
    }
    
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/admin', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.esAdmin) {
        contenido = 'paginas/admin';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/amigosPag', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/amigos';
    }
    res.render('paginaSinSidebar', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/gestion-apuestas', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/gestion-apuestas';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/gestion-eventos', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/gestion-eventos';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/perfil', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    const mostrarFormulario = req.query.modificar === 'true';

    res.render('paginaSinSidebar', {
        contenido: 'paginas/perfil',
        session: req.session,
        mostrarFormulario 
    });
});

contenidoRouter.post('/modificarPerfil', (req, res) => {
    const { nombre, apellido, edad, username } = req.body;

    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.edad = parseInt(edad);
        usuario.username = username;

        usuario.persist(); 

        req.session.nombre = nombre;
        req.session.apellido = apellido;
        req.session.edad = parseInt(edad);
        req.session.username = username;

        res.redirect('/contenido/perfil');
    } catch (e) {
        console.error('Error al actualizar el perfil:', e);

        res.render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            mostrarFormulario: true, // formulario calentito
            error: 'Error al actualizar el perfil. Inténtalo de nuevo.'
        });
    }
});

contenidoRouter.get('/futbol11', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/futbol11';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/futbolSala', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/futbolSala';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/voleibol', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/voleibol';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/rugby', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/rugby';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/baloncesto', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/baloncesto';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/amigos', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/amigos';
    }
    res.render('paginaSinSidebar', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/chat', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    const amigo = req.query.amigo; 
    if (!amigo) {
        return res.status(400).send('Amigo no especificado');
    }

    res.render('paginaSinSidebar', {
        contenido: 'paginas/chat', 
        session: req.session,
        amigo 
    });
});

export default contenidoRouter;


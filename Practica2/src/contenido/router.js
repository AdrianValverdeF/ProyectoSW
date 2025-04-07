import express from 'express';
import { Mensajes } from './mensajes.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Eventos } from './eventos.js';
import { Equipos } from './equipos.js';

import { Chat } from './chat.js';

const contenidoRouter = express.Router();

contenidoRouter.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
});

//lo de arriba es porque me estoy volviendo loca

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
    mensajesConUsuarios.forEach(mEnsaje => {
        
        if(mEnsaje.id_mensaje_respuesta != null){
            let mensajeResp = Mensajes.getMensajeById(mEnsaje.id_mensaje_respuesta);
            mEnsaje.mensajeRespuesta = mensajeResp.mensaje;
        }
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
    let contenido = 'paginas/foroComun';
    let mensajes = Mensajes.getMensajes();
    let mensajesConUsuarios = mensajes.map(mensaje => {
        let usuario = Usuario.getUsuarioById(mensaje.id_usuario);
        return {
            ...mensaje,
            username: usuario ? usuario.username : 'Usuario desconocido'
        };
    });
    mensajesConUsuarios.forEach(mEnsaje => {
        if(mEnsaje.id_mensaje_respuesta != null){
            let mensajeResp = Mensajes.getMensajeById(mEnsaje.id_mensaje_respuesta);
            mEnsaje.mensajeRespuesta = mensajeResp.mensaje;
        }
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
        usuario.username = nombre; 

        usuario.persist(); 

        req.session.nombre = nombre;
        req.session.apellido = apellido;
        req.session.edad = parseInt(edad);
        req.session.username = nombre; 

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
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    try {
        const id_usuario = parseInt(Usuario.getIdByUsername(req.session.username), 10); 
        console.log('ID del usuario logueado:', id_usuario); 
        const amigos = Usuario.getAmigosById(id_usuario); 
        amigos.forEach(amigo => {
            if (amigo.id_usuario == id_usuario)
                amigo.username = Usuario.getUsuarioById(amigo.id_amigo).username;
            else {
                amigo.username = Usuario.getUsuarioById(amigo.id_usuario).username;
            }
        });

        res.render('paginaSinSidebar', {
            contenido: 'paginas/amigos',
            session: req.session,
            amigos : amigos
        });
    } catch (e) {
        console.error('Error al cargar la lista de amigos:', e);
        res.status(500).send('Error al cargar la lista de amigos');
    }
});

contenidoRouter.get('/solicitudes', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    try {
        const id_usuario = parseInt(Usuario.getIdByUsername(req.session.username), 10); 
        console.log('ID del usuario logueado:', id_usuario); 
        const solicitudes = Usuario.getSolicitudesById(id_usuario);
        solicitudes.forEach(solicitud => {
            if (solicitud.id_usuario == id_usuario)
                solicitud.username = Usuario.getUsuarioById(solicitud.id_amigo).username;
            else {
                solicitud.username = Usuario.getUsuarioById(solicitud.id_usuario).username;
            }
        });

        console.log(solicitudes);

        res.render('paginaSinSidebar', {
            contenido: 'paginas/solicitudes',
            session: req.session,
            solicitudes : solicitudes
        });
    } catch (e) {
        console.error('Error al cargar la lista de solicitudes:', e);
        res.status(500).send('Error al cargar la lista de solicitudes');
    }
});

contenidoRouter.get('/chat', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    const amigo = req.query.amigo;
    console.log('Valor de amigo:', amigo); // Depuración
    if (!amigo) {
        return res.status(400).send('Amigo no especificado');
    }

    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);
        const mensajes = Chat.getMensajesByAmigo(id_usuario, id_amigo);

        // Obtener la lista de amigos para la barra lateral
        const amigos = Usuario.getAmigosById(id_usuario);

        res.render('paginaSinSidebar', {
            contenido: 'paginas/chat',
            session: req.session,
            amigo,
            mensajes,
            amigos // Pasar la lista de amigos a la vista
        });
    } catch (e) {
        console.error('Error al cargar el chat:', e);
        res.status(500).send('Error al cargar el chat');
    }
});

contenidoRouter.post('/enviarMensajePriv', (req, res) => {
    console.log('Controlador /enviarMensaje llamado');
    console.log('Datos recibidos:', req.body);

    if (!req.session.login) {
        return res.status(403).send('No tienes permiso para enviar mensajes');
    }

    const { mensaje, amigo } = req.body;
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        const nuevoMensaje = new Chat(mensaje, id_usuario, id_amigo);
        Chat.persist(nuevoMensaje);

        res.redirect(`/contenido/chat?amigo=${amigo}`);
    } catch (e) {
        console.error('Error al enviar el mensaje:', e);
        res.status(500).send('Error al enviar el mensaje');
    }
});

contenidoRouter.post('/nuevaSolicitud', (req, res) => {
    console.log('Controlador /nuevaSolicitud llamado');
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

    const { amigo } = req.body;
    console.log(amigo);
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        Usuario.nuevaSolicitud(id_usuario, id_amigo);
        console.log('hola hola');
        res.redirect(`/contenido/amigos`);
    } catch (e) {
        console.error('Error al enviar solicitud:', e);
        res.status(500).send('Error al enviar solicitud');
    }
});

contenidoRouter.post('/aceptarSolicitud', (req, res) => {
    console.log('Controlador /aceptarSolicitud llamado');
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

    const { amigo } = req.body;
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        Usuario.aceptarSolicitud(id_usuario, id_amigo);
        console.log('hola hola');
        res.redirect(`/contenido/solicitudes`);
    } catch (e) {
        console.error('Error al eliminar amigo:', e);
        res.status(500).send('Error al eliminar amigo');
    }
});

contenidoRouter.post('/eliminarAmigo', (req, res) => {
    console.log('Controlador /eliminarAmigo llamado');
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));

    const { amigo } = req.body;
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        Usuario.eliminar(id_usuario, id_amigo);
        console.log('hola hola');
        res.redirect(`/contenido/perfil`);
    } catch (e) {
        console.error('Error al eliminar amigo:', e);
        res.status(500).send('Error al eliminar amigo');
    }
});

// EVENTOS
contenidoRouter.get('/eventos', (req, res) => {

    let contenido = 'paginas/noPermisos';

    if (req.session.login) {
        contenido = 'paginas/eventos';
    }

    const eventos = Eventos.getEventos();

    res.render('pagina', {
        contenido,
        session: req.session,
        eventos: eventos
    });
});

contenidoRouter.delete('/eventos/:id', (req, res) => {

    if (!req.session.esAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Requiere privilegios de administrador'
        });
    }

    try {
        Eventos.remove(req.params.id);
        res.json({ success: true });
    }
    catch (e) {
        const status = e instanceof EventoNoEncontrado ? 404 : 500;
        res.status(status).json({
            success: false,
            error: e.message
        });
    }
});

contenidoRouter.get('/eventos/crear', (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }

    try {
        const equipos = Equipos.getAll();
        console.log(equipos);
        res.render('pagina', {
            contenido: 'paginas/crearEvento',
            session: req.session,
            equipos: equipos,
            equipoA: null,  // valores por defecto (creo que hacen falta)
            equipoB: null,
            fecha: null,
        })
    }
    catch (e) {
        res.render('pagina', {
            contenido: 'paginas/crearEvento',
            session: req.session,
            equipos: [],
            error: e.message
        })
    }
});

contenidoRouter.post('/eventos/crear', (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }

    try {
        const { equipoA, equipoB, deporte, genero, fecha } = req.body;

        if (equipoA === equipoB) {
            throw new Error('Los equipos no pueden ser iguales');
        }

        const nuevoEvento = new Eventos(
            equipoA,
            equipoB,
            deporte,
            fecha,
            null,
        );

        Eventos.persist(nuevoEvento);
        res.redirect('/contenido/eventos');

    } catch (e) {
        const equipos = Equipos.getAll();
        res.render('pagina', {
            contenido: 'paginas/crearEvento',
            equipos,
            equipoA: req.body.equipoA,
            equipoB: req.body.equipoB,
            deporte: req.body.deporte,
            genero: req.body.genero,
            fecha: req.body.fecha,
            error: e.message,
            session: req.session
        });
    }
});

contenidoRouter.post('/eventos', (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).send('Acceso no autorizado');
    }

    try {
        const { equipoA, equipoB, deporte, fecha } = req.body;
        const nuevoEvento = new Eventos(equipoA, equipoB, deporte, fecha);
        Eventos.persist(nuevoEvento);
        res.redirect('/contenido/eventos');
    } catch (e) {
        res.status(500).render('paginas/error', { error: e.message });
    }
});

contenidoRouter.get('/eventos/:id/editar', (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }

    try {
        const evento = Eventos.getEventoById(req.params.id);
        res.render('pagina', {
            contenido: 'paginas/editarEvento',
            session: req.session,
            evento,
            error: null
        });

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/editarEvento',
            evento: null,
            error: e.message
        });
    }
});

contenidoRouter.post('/eventos/:id/actualizar', (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).send('Acceso no autorizado');
    }

    try {
        const { equipoA, equipoB, deporte, fecha } = req.body;

        const nuevoEquipoA = Equipos.getIdByName(equipoA);
        const nuevoEquipoB = Equipos.getIdByName(equipoB);

        const eventoActualizado = new Eventos(nuevoEquipoA, nuevoEquipoB, deporte, fecha, req.params.id);

        Eventos.persist(eventoActualizado);

        const eventos = Eventos.getEventos();

        res.render('pagina', {
            contenido: 'paginas/eventos',
            session: req.session,
            eventos: eventos
        });
    } catch (e) {
        res.status(500).render('paginas/error', { error: e.message });
    }
});
// FIN EVENTOS


export default contenidoRouter;




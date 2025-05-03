import express from 'express';
import { Mensajes } from './mensajes.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Eventos } from './eventos.js';
import { Equipos } from './equipos.js';
import { MisApuestas } from './misApuestas.js';
import { Chat } from './chat.js';
import { Apuestas } from './apuestas.js';
import { Amigos } from '../usuarios/Amigos.js';

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
        
        if (!mensaje || !id_usuario.id) {
            return res.status(400).send('Mensaje o usuario no válido');
        }

        try {
            const nuevoMensaje = new Mensajes(mensaje, id_usuario.id, created_at, id_mensaje_respuesta, id_foro);
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

contenidoRouter.get('/mis-apuestas', (req, res) => {
    if (!req.session.login) {
        return res.redirect('/usuarios/login'); 
    }

    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const apuestas = MisApuestas.getByUserId(id_usuario.id);
        res.render('pagina', {
            contenido: 'paginas/mis-apuestas',
            session: req.session,
            apuestas
        });
    } catch (e) {
        console.error('Error al cargar las apuestas del usuario:', e);
        res.status(500).send('Error al cargar tus apuestas.');
    }
});

contenidoRouter.get('/modificarUsuario', (req, res) => {

    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/modificarUsuario'; 
    }
        const usuarioParaModificar = Usuario.getUsuarioById(req.query.id);
        usuarioParaModificar.id = parseInt(req.query.id);
        usuarioParaModificar.imagePath = Usuario.getImagen(usuarioParaModificar.id);
        res.render('paginaSinSidebar', {
            contenido,
            user: usuarioParaModificar,
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
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    req.session.fondos = Usuario.getFondosById(id_usuario.id).fondos;

    req.session.imagePath = Usuario.getImagen(id_usuario.id);
    const mostrarFormulario = req.query.modificar === 'true';

    res.render('paginaSinSidebar', {
        contenido: 'paginas/perfil',
        session: req.session,
        mostrarFormulario 
    });
});

contenidoRouter.post('/modificarPerfilUsuario', (req, res) => {
    const { nombre, apellido, edad, username,rol,fondos } = req.body;
    try{
        const usuario = Usuario.getUsuarioByUsername(username);
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.edad = parseInt(edad);
        usuario.username = username;
        usuario.rol = rol;
        usuario.fondos = parseInt(fondos);
        usuario.id = parseInt(req.query.id);
        usuario.persist(usuario);
        res.redirect('/contenido/listaUsuarios'); 
    }
     catch (e) {
        console.error('Error al actualizar el perfil:', e);

        res.render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            error: 'Error al actualizar el perfil. Inténtalo de nuevo.'
    });
}

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

contenidoRouter.get('/buscarUsuarios', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const username = req.query.username || '';
        const nombre = req.query.nombre || '';
        const apellido = req.query.apellido|| '';
        const edad = parseInt(req.query.edad) || '';
        const rol = req.query.rol || '';
        const Users = Usuario.getListaUsuarios(username,nombre,apellido,edad,rol, id_usuario.id);
    
        res.render('paginaSinSidebar', {
            contenido: 'paginas/listaUsuarios',
            session: req.session,
            usuarios: Users
        });
    } catch (e) {
        console.error('Error al cargar la lista de Usuarios:', e);
        res.status(500).send('Error al cargar la lista de Usuarios');
    }

});

contenidoRouter.get('/listaUsuarios', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const Users = Usuario.getAll(id_usuario.id);
        res.render('paginaSinSidebar', {
            contenido: 'paginas/listaUsuarios',
            session: req.session,
            usuarios: Users
        });
    } catch (e) {
        console.error('Error al cargar la lista de Usuarios:', e);
        res.status(500).send('Error al cargar la lista de Usuarios');
    }
});


contenidoRouter.get('/amigos', (req, res) => {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }

    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username); 
        const amigos = Amigos.getAmigosById(parseInt(id_usuario.id)); 

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
        const id_usuario = Usuario.getIdByUsername(req.session.username); 
        const solicitudes = Amigos.getSolicitudesById(id_usuario.id);
        solicitudes.forEach(solicitud => {
            if (solicitud.id_usuario == id_usuario.id)
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
    if (!amigo) {
        return res.status(400).send('Amigo no especificado');
    }

    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);
        const mensajes = Chat.getMensajesByAmigo(id_usuario.id, id_amigo.id);

        // Obtener la lista de amigos para la barra lateral
        const amigos = Amigos.getAmigosById(parseInt(id_usuario.id));

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

        const nuevoMensaje = new Chat(mensaje, id_usuario.id, id_amigo);
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
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        Usuario.nuevaSolicitud(id_usuario.id, id_amigo);
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

        Usuario.aceptarSolicitud(id_usuario.id, id_amigo);
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

        Usuario.eliminar(id_usuario.id, id_amigo);
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

    eventos.forEach(evento => {
        if (evento.genero === 'M') {
            evento.genero = 'Masculino';
        } else if (evento.genero === 'F') {
            evento.genero = 'Femenino';
        }
    });
    
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


contenidoRouter.post('/agregarFondos', async (req, res) => {

    const cantidad = parseInt(req.body.cantidad);

    if (isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).send('Cantidad de fondos inválida');
    }

    try{    
        const idUsuario = Usuario.getIdByUsername(req.session.username);
        
        await Usuario.agregarFondos(idUsuario.id, cantidad);
        req.session.fondos = Usuario.getFondosById(idUsuario.id).fondos; 
        res.redirect('/contenido/perfil');
    }   
    catch (e) {
        console.error('Error al agregar fondos:', e);
        res.redirect('/contenido/perfil');
        return res.status(500).send('Error al agregar fondos');
    }
});


// APUESTAS

contenidoRouter.get('/apuestas/:id', (req, res) => {

    const id_evento = req.params.id;

    try{
        const evento = Eventos.getEventoById(id_evento);

        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        res.render('pagina', {
            contenido: 'paginas/apuestas',
            session: req.session,
            evento: evento
        });
    }
    catch (e) {
        return res.status(500).send('Error al obtener el evento de apuesta');
    }
});

contenidoRouter.post('/apuestas/:id/apostar', (req, res) => {
    if (!req.session.login) {
        return res.redirect('/usuarios/login');
    }

    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const id_evento = req.params.id;
    const { ganador, resultadoExacto, diferenciaPuntos } = req.body;
    const cantidad_apuesta = 10;
    try {
        Usuario.restarFondos(id_usuario.id, cantidad_apuesta);
        req.session.fondos = Usuario.getFondosById(id_usuario.id).fondos;
        Apuestas.insertarApuesta({
            id_usuario: id_usuario.id,
            multiplicador: 1, 
            cantidad_apuesta, 
            id_eventos: id_evento, 
            combinada: 0 
        });

        res.redirect('/contenido/mis-apuestas');
    } catch (e) {
        console.error('Error al insertar apuesta:', e);
        res.status(400).send(e.message || 'Error al insertar apuesta');
    }
});


export default contenidoRouter;




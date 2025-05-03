import express from 'express';
import { Mensajes } from './mensajes.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Eventos } from './eventos.js';
import { Equipos } from './equipos.js';
import { MisApuestas } from './misApuestas.js';
import { Chat } from './chat.js';
import { Apuestas } from './apuestas.js';

const contenidoRouter = express.Router();

contenidoRouter.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
});

//lo de arriba es porque me estoy volviendo loca


function auth(req, res, next) {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/noPermisos',
            session: req.session
        });
    }
    next();
}


//hecho
contenidoRouter.get('/foroComun', auth, (req, res) => {
    let contenido = 'paginas/foroComun';
    let mensajes = Mensajes.getMensajes();

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => {
        mapaUsuarios[u.id] = u.username;
    });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds(idsMensajesRespuesta);
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        mapaMensajesRespuesta[mr.id] = mr.mensaje;
    });

    let mensajesConUsuarios = mensajes.map(mensaje => {
        return {
            ...mensaje,
            username: mapaUsuarios[mensaje.id_usuario] || 'Usuario desconocido',
            mensajeRespuesta: mensaje.id_mensaje_respuesta ? mapaMensajesRespuesta[mensaje.id_mensaje_respuesta] : undefined
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


//hecho
contenidoRouter.get('/mensajes', auth, [query('id').optional().isInt().toInt()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Parámetros inválidos');
    }

    const data = matchedData(req);
    let contenido = 'paginas/foroComun';

    let mensajes = Mensajes.getMensajes();

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => {
        mapaUsuarios[u.id] = u.username;
    });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds(idsMensajesRespuesta);
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        mapaMensajesRespuesta[mr.id] = mr.mensaje;
    });

    let mensajesConUsuarios = mensajes.map(mensaje => {
        return {
            ...mensaje,
            username: mapaUsuarios[mensaje.id_usuario] || 'Usuario desconocido',
            mensajeRespuesta: mensaje.id_mensaje_respuesta ? mapaMensajesRespuesta[mensaje.id_mensaje_respuesta] : undefined
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
        contenido: 'paginas/normal',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/admin', auth, (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.esAdmin) {
        contenido = 'paginas/admin';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

//hecho
contenidoRouter.get('/amigosPag', auth, (req, res) => {
    res.render('paginaSinSidebar', {
        contenido: 'paginas/amigos',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/gestion-apuestas', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/gestion-apuestas',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/gestion-eventos', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/gestion-eventos',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/mis-apuestas', auth, (req, res) => {
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


//
//-------------------------------------------------------------------------------//
contenidoRouter.get('/perfil', auth, (req, res) => {
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    req.session.fondos = Usuario.getFondosById(id_usuario);

    req.session.imagePath = Usuario.getImagen(id_usuario);
    const mostrarFormulario = req.query.modificar === 'true';

    res.render('paginaSinSidebar', {
        contenido: 'paginas/perfil',
        session: req.session,
        mostrarFormulario 
    });
});

//hecho
contenidoRouter.post('/modificarPerfilUsuario', auth, [
    body('nombre').isString().notEmpty(),
    body('apellido').isString().notEmpty(),
    body('edad').isInt({ min: 0 }),
    body('username').isString().notEmpty(),
    body('rol').isString().notEmpty(),
    body('fondos').isInt({ min: 0 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const usuarioParaModificar = Usuario.getUsuarioById(req.query.id);
        usuarioParaModificar.imagePath = Usuario.getImagen(usuarioParaModificar.id);
        return res.status(400).render('paginaSinSidebar', {
            contenido: 'paginas/modificarUsuario',
            session: req.session,
            user: usuarioParaModificar,
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { nombre, apellido, edad, username, rol, fondos } = req.body;
    try {
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
    } catch (e) {
        console.error('Error al actualizar el perfil:', e);
        const usuarioParaModificar = Usuario.getUsuarioById(req.query.id);
        usuarioParaModificar.imagePath = Usuario.getImagen(usuarioParaModificar.id);
        res.render('paginaSinSidebar', {
            contenido: 'paginas/modificarUsuario',
            session: req.session,
            user: usuarioParaModificar,
            error: 'Error al actualizar el perfil. Inténtalo de nuevo.'
        });
    }
});


//ESTA FUNCION SIN TOCARSE NO VA
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

//hecho
contenidoRouter.get('/futbol11', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/futbol11',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/futbolSala', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/futbolSala',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/voleibol', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/voleibol',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/rugby', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/rugby',
        session: req.session
    });
});

//hecho
contenidoRouter.get('/baloncesto', auth, (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/baloncesto',
        session: req.session
    });
});
//-----------------------------------------------------------------//
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
//-----------------------------------------------------------------//
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
            amigos: amigos
        });
    } catch (e) {
        console.error('Error al cargar la lista de amigos:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/amigos',
            session: req.session,
            amigos: [],
            error: 'Error al cargar la lista de amigos. Inténtalo de nuevo.'
        });
    }
});


//hecho

contenidoRouter.get('/solicitudes', auth, (req, res) => {
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
            solicitudes: solicitudes
        });
    } catch (e) {
        console.error('Error al cargar la lista de solicitudes:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/solicitudes',
            session: req.session,
            solicitudes: [],
            error: 'Error al cargar la lista de solicitudes. Inténtalo de nuevo.'
        });
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




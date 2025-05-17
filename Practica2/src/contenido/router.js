import express from 'express';
import { Mensajes } from './mensajes.js';
import { Usuario } from '../usuarios/Usuario.js';
import { Eventos } from './eventos.js';
import { Equipos } from './equipos.js';
import { Competiciones } from './competiciones.js';
import { MisApuestas } from './misApuestas.js';
import { Chat } from './chat.js';
import { Apuestas } from './apuestas.js';
import { body, validationResult, matchedData, query, param } from 'express-validator';
import { render, renderSin } from '../utils/render.js';
import { uploadProfileImage } from '../upload.js';
import fs from 'fs';
import path from 'path';

const contenidoRouter = express.Router();



function auth(req, res, next) {
    if (!req.session.login) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            session: req.session
        });
    }
    next();
}

export function eliminarImagen(nombreArchivo) {
    const ruta = path.join(process.cwd(), 'static', 'img', 'uploads', nombreArchivo);
    if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
        return true;
    }
    return false;
}

//hecho -
contenidoRouter.get('/foroComun', (req, res) => {
    let contenido = 'paginas/foroComun';
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 1);
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
            mensajeRespuesta: mensaje.id_mensaje_respuesta ? mapaMensajesRespuesta[mensaje.id_mensaje_respuesta] : undefined,
            respUsername: mensaje.id_mensaje_respuesta ? mapaUsuarios[Mensajes.getMensajeById(mensaje.id_mensaje_respuesta).id_usuario] : undefined
        };
    });

    let resp = false;
    render(req, res, contenido, {
        session: req.session,
        mensajes: mensajesConUsuarios,
        respuesta: resp
    });
});


//hecho -
contenidoRouter.get('/mensajes', auth, [query('id').optional().isInt().toInt()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Parámetros inválidos');
    }

    const data = matchedData(req);
    let contenido = 'paginas/foroComun';

let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 1);

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
            mensajeRespuesta: mensaje.id_mensaje_respuesta ? mapaMensajesRespuesta[mensaje.id_mensaje_respuesta] : undefined,
            respUsername: mensaje.id_mensaje_respuesta ? mapaUsuarios[Mensajes.getMensajeById(mensaje.id_mensaje_respuesta).id_usuario] : undefined
        };
    });

    let resp = false;
    if (req.session.login) {;
        let id_mensaje_respuesta = parseInt(req.query.id);
        let mRespuesta = Mensajes.getMensajeById(id_mensaje_respuesta);
        let usuario = Usuario.getUsuarioById(mRespuesta.id_usuario);
        mRespuesta.username = usuario ? usuario.username : 'Usuario desconocido';
        resp = true;
        

        render(req, res, contenido, {
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

//hecho
contenidoRouter.post('/enviarmensaje', auth, [
    body('mensaje').isString().notEmpty().withMessage('El mensaje no puede estar vacío')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/foroComun',
            session: req.session,
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { mensaje } = matchedData(req);
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const datas = new Date();
    const horaEnvio = datas.getHours() + ":" + datas.getMinutes();
    const created_at = horaEnvio;
    const id_mensaje_respuesta = req.body.id_respuesta;
    const id_foro = 1;

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
        res.redirect('/contenido/foroComun');
    } catch (e) {
        res.status(500).render('pagina', {
            contenido: 'paginas/foroComun',
            session: req.session,
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

//hecho -
contenidoRouter.get('/normal', auth, (req, res) => {
    render (req, res, 'paginas/normal', {
        session: req.session
    });
});

//hecho -
contenidoRouter.get('/admin', auth, (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.esAdmin) {
        contenido = 'paginas/admin';
    }
    render(req, res, contenido, {
        session: req.session
    });
});

//hecho -
contenidoRouter.get('/amigosPag', auth, (req, res) => {
    render (req, res, 'paginas/amigos', {
        session: req.session
    });
});

//hecho -
contenidoRouter.get('/gestion-apuestas', auth, (req, res) => {
    render (req, res, 'paginas/gestion-apuestas', {
        session: req.session
    });
});

//hecho -
contenidoRouter.get('/gestion-eventos', auth, (req, res) => {
    render (req, res, 'paginas/gestion-eventos', {
        session: req.session
    });
});

//hecho -
contenidoRouter.get('/mis-apuestas', auth, (req, res) => {
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        let apuestas = MisApuestas.getByUserId(id_usuario);

        const ahora = new Date();
        apuestas = apuestas.map(apuesta => {
            const fechaEvento = new Date(apuesta.fecha);
            apuesta.estado = ahora < fechaEvento ? 'pendiente' : 'finalizada';
            return apuesta;
        });

        render(req, res, 'paginas/mis-apuestas', {
            session: req.session,
            apuestas
        });
    } catch (e) {
        console.error('Error al cargar las apuestas del usuario:', e);
        res.status(500).send('Error al cargar tus apuestas.');
    }
});


//hecho -
contenidoRouter.get('/modificarUsuario', auth, (req, res) => {
    const usuarioParaModificar = Usuario.getUsuarioById(req.query.id);
    usuarioParaModificar.imagePath = Usuario.getImagen(usuarioParaModificar.id);
    render(req, res, 'paginas/modificarUsuario', {
        session: req.session,
        user: usuarioParaModificar
    });
});


//hecho -
contenidoRouter.get('/gestion-eventos', auth, (req, res) => {
    render (req, res, 'paginas/gestion-eventos', {
        session: req.session
    });
});


//
//-------------------------------------------------------------------------------//
// es una sugerencia pero me da palo
contenidoRouter.get('/perfil', auth, (req, res) => {

    const id_usuario = Usuario.getIdByUsername(req.session.username);
    req.session.fondos = Usuario.getFondosById(id_usuario);

    req.session.imagePath = Usuario.getImagen(id_usuario);
    const mostrarFormulario = req.query.modificar === 'true';

    renderSin(req, res, 'paginas/perfil', {
        session: req.session,
        mostrarFormulario
    });
});

//hecho -
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
        render(req, res, 'paginas/modificarUsuario', {
            session: req.session,
            user: usuarioParaModificar,
        });
    }
});


//ESTA FUNCION SIN TOCARSE NO VA
contenidoRouter.post('/modificarPerfil', uploadProfileImage, (req, res) => {
    const { nombre, apellido, edad } = req.body;
    

    try {
        let imagePath = null;
        if (req.file) {
            imagePath = `/img/uploads/${req.file.filename}`;
        }
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        const rutaRelativa = Usuario.getImagen(Usuario.getIdByUsername(req.session.username)); 
        Usuario.updateImagen(Usuario.getIdByUsername(req.session.username), imagePath);
        if (rutaRelativa) {
            console.log('Ruta relativa:', rutaRelativa);
            const nombreArchivo = path.basename(rutaRelativa.rutaImg);
            console.log('Nombre del archivo:', nombreArchivo);
            eliminarImagen(nombreArchivo);
        }
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.edad = parseInt(edad);
        usuario.username = req.session.username; 
        usuario.persist(); 

        req.session.nombre = nombre;
        req.session.apellido = apellido;
        req.session.edad = parseInt(edad);
        req.session.username = usuario.username; 

        res.redirect('/contenido/perfil');
    } catch (e) {
        console.error('Error al actualizar el perfil:', e);

        renderSin(req, res, 'paginas/perfil', {
            session: req.session,
            mostrarFormulario: true, // formulario calentito
        });
    }
});

//hecho
contenidoRouter.get('/futbol11', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'futbol11'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 2);

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido',
        mensajeRespuesta: m.id_mensaje_respuesta ? (mapaMensajesRespuesta[m.id_mensaje_respuesta]?.mensaje || '') : null,
        respUsername: m.id_mensaje_respuesta ? (mapaUsuarios[mapaMensajesRespuesta[m.id_mensaje_respuesta]?.id_usuario] || 'Usuario desconocido') : null
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }

    res.render('pagina', {
        contenido: 'paginas/eventos',
        session: req.session,
        eventos,
        foro: 'foroFutbol11.ejs',
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//hecho
contenidoRouter.get('/futbolSala', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'futbolsala'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 6);

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido',
        mensajeRespuesta: m.id_mensaje_respuesta ? (mapaMensajesRespuesta[m.id_mensaje_respuesta]?.mensaje || '') : null,
        respUsername: m.id_mensaje_respuesta ? (mapaUsuarios[mapaMensajesRespuesta[m.id_mensaje_respuesta]?.id_usuario] || 'Usuario desconocido') : null
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }

    res.render('pagina', {
        contenido: 'paginas/futbolSala',
        session: req.session,
        eventos,
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//hecho
contenidoRouter.get('/voleibol', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'voleibol'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 4);

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido',
        mensajeRespuesta: m.id_mensaje_respuesta ? (mapaMensajesRespuesta[m.id_mensaje_respuesta]?.mensaje || '') : null,
        respUsername: m.id_mensaje_respuesta ? (mapaUsuarios[mapaMensajesRespuesta[m.id_mensaje_respuesta]?.id_usuario] || 'Usuario desconocido') : null
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }

    res.render('pagina', {
        contenido: 'paginas/eventos', 
        session: req.session,
        eventos,
        foro: 'foroVoleibol.ejs',   
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//hecho
contenidoRouter.get('/rugby', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'rugby'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 5); 
    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido',
        mensajeRespuesta: m.id_mensaje_respuesta ? (mapaMensajesRespuesta[m.id_mensaje_respuesta]?.mensaje || '') : null,
        respUsername: m.id_mensaje_respuesta ? (mapaUsuarios[mapaMensajesRespuesta[m.id_mensaje_respuesta]?.id_usuario] || 'Usuario desconocido') : null
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }

    res.render('pagina', {
        contenido: 'paginas/eventos',
        session: req.session,
        eventos,
        foro: 'foroRugby.ejs',
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//hecho
contenidoRouter.get('/baloncesto', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'baloncesto'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 3); 

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido',
        mensajeRespuesta: m.id_mensaje_respuesta ? (mapaMensajesRespuesta[m.id_mensaje_respuesta]?.mensaje || '') : null,
        respUsername: m.id_mensaje_respuesta ? (mapaUsuarios[mapaMensajesRespuesta[m.id_mensaje_respuesta]?.id_usuario] || 'Usuario desconocido') : null
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }

    res.render('pagina', {
        contenido: 'paginas/eventos',
        session: req.session,
        eventos,
        foro: 'foroBaloncesto.ejs',
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//hecho -
contenidoRouter.get('/buscarUsuarios', auth, (req, res) => {
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const username = req.query.username || '';
        const nombre = req.query.nombre || '';
        const apellido = req.query.apellido || '';
        const edad = parseInt(req.query.edad) || '';
        const rol = req.query.rol || '';
        const Users = Usuario.getListaUsuarios(username, nombre, apellido, edad, rol, id_usuario);

        renderSin(req, res, 'paginas/listaUsuarios', 
            {
            session: req.session,
            usuarios: Users
        });
    } catch (e) {
        console.error('Error al cargar la lista de Usuarios:', e);
        res.status(500).send('Error al cargar la lista de Usuarios');
    }
});

//hecho -
contenidoRouter.get('/listaUsuarios', auth, (req, res) => {
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const Users = Usuario.getAll(id_usuario);

        renderSin(req, res, 'paginas/listaUsuarios', {
            session: req.session,
            usuarios: Users
        });
    } catch (e) {
        console.error('Error al cargar la lista de Usuarios:', e);
        res.status(500).send('Error al cargar la lista de Usuarios');
    }
});


//-------------------------------------------------------------------------------

contenidoRouter.get('/amigos', auth, (req, res) => {
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

        renderSin(req, res, 'paginas/amigos', {
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
        const solicitudes = Usuario.getSolicitudesById(id_usuario);
        solicitudes.forEach(solicitud => {
            if (solicitud.id_usuario == id_usuario)
                solicitud.username = Usuario.getUsuarioById(solicitud.id_amigo).username;
            else {
                solicitud.username = Usuario.getUsuarioById(solicitud.id_usuario).username;
            }
        });
        renderSin(req, res, 'paginas/solicitudes', {
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

//hecho -
contenidoRouter.get('/chat', auth, [
    query('amigo').isString().notEmpty().withMessage('Debes especificar un amigo')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginaSinSidebar', {
            contenido: 'paginas/chat',
            session: req.session,
            mensajes: [],
            amigos: [],
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { amigo } = matchedData(req);
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);
        const mensajes = Chat.getMensajesByAmigo(id_usuario, id_amigo);

        const amigos = Usuario.getAmigosById(id_usuario);
        renderSin(req, res, 'paginas/chat', {
            session: req.session,
            id_usuario,
            amigo,
            mensajes,
            amigos
        });
    } catch (e) {
        console.error('Error al cargar el chat:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/chat',
            session: req.session,
            mensajes: [],
            amigos: [],
            error: 'Error al cargar el chat. Inténtalo de nuevo.'
        });
    }
});

//hecho -
contenidoRouter.post('/enviarMensajePriv', auth, (req, res) => {
    const { mensaje, amigo } = req.body;
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        const nuevoMensaje = new Chat(mensaje, id_usuario, id_amigo);
        Chat.persist(nuevoMensaje);

        res.redirect(`/contenido/chat?amigo=${amigo}`);
    } catch (e) {
        console.error('Error al enviar el mensaje:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/chat',
            session: req.session,
            mensajes: [],
            amigos: [],
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

//hecho -
contenidoRouter.post('/nuevaSolicitud', auth, [
    body('amigo').isString().notEmpty().withMessage('Debes especificar un amigo')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginaSinSidebar', {
            contenido: 'paginas/amigos',
            session: req.session,
            amigos: [],
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { amigo } = matchedData(req);
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        let id_amigo;
        try {
            id_amigo = Usuario.getIdByUsername(amigo);
        } catch (e) {
            return res.status(400).render('paginaSinSidebar', {
                contenido: 'paginas/amigos',
                session: req.session,
                amigos: [],
                error: `El usuario "${amigo}" no existe.`
            });
        }

        Usuario.nuevaSolicitud(id_usuario, id_amigo);
        res.redirect(`/contenido/amigos`);
    } catch (e) {
        console.error('Error al enviar solicitud:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/amigos',
            session: req.session,
            amigos: [],
            error: 'Error al enviar la solicitud. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.post('/aceptarSolicitud', auth, [
    body('amigo').isString().notEmpty().withMessage('Debes especificar un amigo')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginaSinSidebar', {
            contenido: 'paginas/solicitudes',
            session: req.session,
            solicitudes: [],
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { amigo } = matchedData(req);
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        Usuario.aceptarSolicitud(id_usuario, id_amigo);
        res.redirect(`/contenido/solicitudes`);
    } catch (e) {
        console.error('Error al aceptar solicitud:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/solicitudes',
            session: req.session,
            solicitudes: [],
            error: 'Error al aceptar la solicitud. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.post('/eliminarAmigo', auth, [
    body('amigo').isString().notEmpty().withMessage('Debes especificar un amigo')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { amigo } = matchedData(req);
    try {
        const id_usuario = Usuario.getIdByUsername(req.session.username);
        const id_amigo = Usuario.getIdByUsername(amigo);

        Usuario.eliminar(id_usuario, id_amigo);
        res.redirect(`/contenido/perfil`);
    } catch (e) {
        console.error('Error al eliminar amigo:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            error: 'Error al eliminar amigo. Inténtalo de nuevo.'
        });
    }
});

// EVENTOS

//hecho
contenidoRouter.get('/eventos', auth, (req, res) => {
    const eventos = Eventos.getEventos();

    const ahora = new Date();
    eventos.forEach(evento => {
        if (evento.genero === 'M') {
            evento.genero = 'Masculino';
        } else if (evento.genero === 'F') {
            evento.genero = 'Femenino';
        }
        evento.estado = ahora < new Date(evento.fecha) ? 'En curso' : 'Finalizado';
    });

    render(req, res, 'paginas/eventos', {
        session: req.session,
        eventos: eventos
    });
    
});

//hecho
contenidoRouter.delete('/eventos/:id', auth, [
    param('id').isInt().withMessage('ID de evento inválido')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Requiere privilegios de administrador'
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { id } = matchedData(req);
    try {
        Eventos.remove(id);
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

//hecho
contenidoRouter.get('/eventos/crear', auth, (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }

    try {
        const equipos = Equipos.getAll();
        render(req, res, 'paginas/crearEvento', {
            session: req.session,
            equipos: equipos,
            equipoA: null,
            equipoB: null,
            fecha: null,
            // fecha_fin: null, 
        });
    }
    catch (e) {
        render(req, res, 'paginas/crearEvento', {
            session: req.session,
            equipos: [],
            error: e.message,
            // fecha_fin: null 
        });
    }
});

//hecho
contenidoRouter.post('/eventos/crear', auth, [
    body('equipoA').isString().notEmpty().withMessage('Debes seleccionar el equipo A'),
    body('equipoB').isString().notEmpty().withMessage('Debes seleccionar el equipo B'),
    body('deporte').isString().notEmpty().withMessage('Debes seleccionar el deporte'),
    body('genero').isString().notEmpty().withMessage('Debes seleccionar el género'),
    body('fecha').isString().notEmpty().withMessage('Debes indicar la fecha')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const equipos = Equipos.getAll();
        return res.status(400).render('pagina', {
            contenido: 'paginas/crearEvento',
            equipos,
            equipoA: req.body.equipoA,
            equipoB: req.body.equipoB,
            deporte: req.body.deporte,
            genero: req.body.genero,
            fecha: req.body.fecha,
            error: errors.array().map(e => e.msg).join(', '),
            session: req.session
        });
    }
    const { equipoA, equipoB, deporte, genero, fecha } = matchedData(req); 
    try {
        if (equipoA === equipoB) {
            throw new Error('Los equipos no pueden ser iguales');
        }
        const nuevoEvento = new Eventos(equipoA, equipoB, deporte, fecha, null, genero); 
        Eventos.persist(nuevoEvento);
        res.redirect('/contenido/eventos');
    } catch (e) {
        const equipos = Equipos.getAll();
        render(req, res, 'paginas/crearEvento', {
            equipos,
            equipoA,
            equipoB,
            deporte,
            genero,
            fecha,
            error: e.message,
            session: req.session
        });
    }
});

//hecho
contenidoRouter.post('/eventos', auth, [
    body('equipoA').isString().notEmpty(),
    body('equipoB').isString().notEmpty(),
    body('deporte').isString().notEmpty(),
    body('fecha').isString().notEmpty()
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).send('Acceso no autorizado');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/error', { error: errors.array().map(e => e.msg).join(', ') });
    }
    const { equipoA, equipoB, deporte, fecha } = matchedData(req);
    try {
        const nuevoEvento = new Eventos(equipoA, equipoB, deporte, fecha);
        Eventos.persist(nuevoEvento);
        res.redirect('/contenido/eventos');
    } catch (e) {
        res.status(500).render('paginas/error', { error: e.message });
    }
});

//hecho
contenidoRouter.get('/eventos/:id/editar', auth, [
    param('id').isInt().withMessage('ID de evento inválido')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/error', { error: errors.array().map(e => e.msg).join(', ') });
    }
    const { id } = matchedData(req);
    try {
        const evento = Eventos.getEventoById(id);
        render(req, res, 'paginas/editarEvento', {
            session: req.session,
            evento,
            error: null
        });
    } catch (e) {
        render(req, res, 'paginas/editarEvento', {
            session: req.session,
            evento: null,
            error: e.message
        });
    }
});

//hecho
contenidoRouter.post('/eventos/:id/actualizar', auth, [
    param('id').isInt().withMessage('ID de evento inválido'),
    body('equipoA').isString().notEmpty(),
    body('equipoB').isString().notEmpty(),
    body('deporte').isString().notEmpty(),
    body('fecha').isString().notEmpty()
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).send('Acceso no autorizado');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/error', { error: errors.array().map(e => e.msg).join(', ') });
    }
    const { id, equipoA, equipoB, deporte, fecha } = matchedData(req);
    try {
        const nuevoEquipoA = Equipos.getIdByName(equipoA);
        const nuevoEquipoB = Equipos.getIdByName(equipoB);
        const eventoActualizado = new Eventos(nuevoEquipoA, nuevoEquipoB, deporte, fecha, id);
        Eventos.persist(eventoActualizado);
        res.redirect('/contenido/eventos');
    } catch (e) {
        res.status(500).render('paginas/error', { error: e.message });
    }
});
// FIN EVENTOS


//hecho
contenidoRouter.post('/agregarFondos', auth, [
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad de fondos inválida')
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { cantidad } = matchedData(req);

    try {
        const idUsuario = Usuario.getIdByUsername(req.session.username);
        await Usuario.agregarFondos(idUsuario, cantidad);
        req.session.fondos = Usuario.getFondosById(idUsuario);
        res.redirect('/contenido/perfil');
    } catch (e) {
        console.error('Error al agregar fondos:', e);
        res.status(500).render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            error: 'Error al agregar fondos. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.get('/apuestas/:id', auth, [
    param('id').isInt().withMessage('ID de evento inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Evento no válido');
    }
    const { id } = matchedData(req);
    try {
        const evento = Eventos.getEventoById(id);
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }
        render(req, res, 'paginas/apuestas', {
            session: req.session,
            evento
        });
    } catch (e) {
        return res.status(500).send('Error al obtener el evento de apuesta');
    }
});

//hecho
contenidoRouter.post('/apuestas/:id/apostar', auth, [
  param('id').isInt().withMessage('ID de evento inválido')
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.status(400).send('Evento no válido');

  const { id } = matchedData(req);
  const evento = Eventos.getEventoById(id);
  if (!evento) return res.status(404).send('Evento no encontrado');

  if (new Date(evento.fecha) <= new Date()) {
    req.session.apuestaError = 'No puedes apostar en un evento finalizado.';
    return res.redirect('/contenido/eventos');
  }

  const id_usuario = Usuario.getIdByUsername(req.session.username);
  const {
    cantidad_apuesta,
    apuesta_ganador,
    apuesta_puntosA,
    apuesta_puntosB,
    apuesta_resultadoExacto,
    apuesta_diferenciaPuntos,
    ganador,
    puntosEquipoA,
    puntosEquipoB,
    resultadoExacto,
    diferenciaPuntos,
    multiplicador
  } = req.body;

  try {

    const cantidadApuesta = parseInt(cantidad_apuesta, 10);
    const fondosUsuario = Usuario.getFondosById(id_usuario);

    if (cantidadApuesta > fondosUsuario) {
        req.session.apuestaError = 'Fondos insuficientes para realizar la apuesta (' + cantidadApuesta + '€). Dispones de ' + fondosUsuario + '€';
        return res.redirect(req.get('referer'));
    }

    Usuario.restarFondos(id_usuario, cantidad_apuesta);
    req.session.fondos = fondosUsuario - cantidadApuesta;

    const apuesta = {
      id_usuario,
      multiplicador: parseFloat(multiplicador) || 1,
      cantidad_apuesta: parseInt(cantidad_apuesta, 10),
      id_eventos: id,
      id_competicion: null,
      ganador: apuesta_ganador ? ganador : null,
      puntos_equipoA: apuesta_puntosA ? puntosEquipoA : null,
      puntos_equipoB: apuesta_puntosB ? puntosEquipoB : null,
      resultado_exacto: apuesta_resultadoExacto ? resultadoExacto : null,
      diferencia_puntos: apuesta_diferenciaPuntos ? diferenciaPuntos : null,
      combinada: criterios > 1 ? 1 : 0,
      estado: 'pendiente',
      ganancia: 0
    };

    const criterios = [
        apuesta_ganador,
        apuesta_puntosA,
        apuesta_puntosB,
        apuesta_resultadoExacto,
        apuesta_diferenciaPuntos
    ].filter(Boolean).length;

    apuesta.combinada = criterios > 1 ? 1 : 0;

    const evento = Eventos.getEventoById(apuesta.id_eventos);
    apuesta.fecha_fin = evento?.fecha_fin || null;
    apuesta.estado = 'pendiente';
    apuesta.ganancia = 0;

    Apuestas.insertarApuesta(apuesta);
    res.redirect('/contenido/mis-apuestas');
  } catch (e) {
    console.error('Error al insertar apuesta:', e);
    res.status(400).send(e.message || 'Error al insertar apuesta');
  }
});


contenidoRouter.get('/foroFutbol11', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'futbol11'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 2);

    // Obtener usuarios y mensajes de respuesta
    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido'
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }
    res.render('pagina', {
        contenido: 'paginas/futbol11',
        session: req.session,
        eventos,
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//hecho
contenidoRouter.post('/enviarMensajeFutbol11', auth, [
    body('mensaje').isString().notEmpty().withMessage('El mensaje no puede estar vacío')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/foroFutbol11',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 2),
            error: errors.array().map(e => e.msg).join(', ')
        });
    }
    const { mensaje } = matchedData(req);
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const created_at = new Date().toISOString();
    const id_foro = 2; // Fútbol 11
    const id_mensaje_respuesta = req.body.id_respuesta || null;

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
res.redirect('/contenido/futbol11');
    } catch (e) {
        res.status(500).render('pagina', {
            contenido: 'paginas/foroFutbol11',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 2),
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.post('/enviarMensajeBaloncesto', auth, [
    body('mensaje').isString().notEmpty().withMessage('El mensaje no puede estar vacío')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/foroBaloncesto',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 3),
            error: errors.array().map(e => e.msg).join(', ')
        });
    }
    const { mensaje } = matchedData(req);
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const created_at = new Date().toISOString();
    const id_foro = 3; // Baloncesto
    const id_mensaje_respuesta = req.body.id_respuesta || null;

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
        res.redirect('/contenido/baloncesto');
    } catch (e) {
        res.status(500).render('pagina', {
            contenido: 'paginas/foroBaloncesto',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 3),
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.post('/enviarMensajeRugby', auth, [
    body('mensaje').isString().notEmpty().withMessage('El mensaje no puede estar vacío')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/foroRugby',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 5),
            error: errors.array().map(e => e.msg).join(', ')
        });
    }
    const { mensaje } = matchedData(req);
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const created_at = new Date().toISOString();
    const id_foro = 5;
    const id_mensaje_respuesta = req.body.id_respuesta || null;

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
        res.redirect('/contenido/rugby');
    } catch (e) {
        res.status(500).render('pagina', {
            contenido: 'paginas/foroRugby',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 5),
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.post('/enviarMensajeFutbolSala', auth, [
    body('mensaje').isString().notEmpty().withMessage('El mensaje no puede estar vacío')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/foroFutbolSala',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 6),
            error: errors.array().map(e => e.msg).join(', ')
        });
    }
    const { mensaje } = matchedData(req);
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const created_at = new Date().toISOString();
    const id_foro = 6;
    const id_mensaje_respuesta = req.body.id_respuesta || null;

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
        res.redirect('/contenido/futbolSala');
    } catch (e) {
        res.status(500).render('pagina', {
            contenido: 'paginas/foroFutbolSala',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 4),
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

//hecho
contenidoRouter.post('/enviarMensajeVoleibol', auth, [
    body('mensaje').isString().notEmpty().withMessage('El mensaje no puede estar vacío')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('pagina', {
            contenido: 'paginas/foroVoleibol',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 4),
            error: errors.array().map(e => e.msg).join(', ')
        });
    }
    const { mensaje } = matchedData(req);
    const id_usuario = Usuario.getIdByUsername(req.session.username);
    const created_at = new Date().toISOString();
    const id_foro = 4; // Voleibol
    const id_mensaje_respuesta = req.body.id_respuesta || null;

    try {
        const nuevoMensaje = new Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro);
        Mensajes.persist(nuevoMensaje);
        res.redirect('/contenido/voleibol');
    } catch (e) {
        res.status(500).render('pagina', {
            contenido: 'paginas/foroVoleibol',
            session: req.session,
            mensajes: Mensajes.getMensajes().filter(m => m.id_foro === 4),
            error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
    }
});

contenidoRouter.get('/foroVoleibol', auth, (req, res) => {
    const eventos = Eventos.getEventos().filter(e =>
        e.deporte && e.deporte.toLowerCase().replace(/\s/g, '') === 'voleibol'
    );
    let mensajes = Mensajes.getMensajes().filter(m => m.id_foro === 4); 

    const idsUsuarios = [...new Set(mensajes.map(m => m.id_usuario))];
    const usuarios = Usuario.getUsuariosByIds(idsUsuarios);
    const mapaUsuarios = {};
    usuarios.forEach(u => { mapaUsuarios[u.id] = u.username; });

    const idsMensajesRespuesta = [
        ...new Set(
            mensajes
                .filter(m => m.id_mensaje_respuesta != null)
                .map(m => m.id_mensaje_respuesta)
        )
    ];
    const mensajesRespuesta = Mensajes.getMensajesByIds
        ? Mensajes.getMensajesByIds(idsMensajesRespuesta)
        : idsMensajesRespuesta.map(id => Mensajes.getMensajeById(id));
    const mapaMensajesRespuesta = {};
    mensajesRespuesta.forEach(mr => {
        if (mr) mapaMensajesRespuesta[mr.id] = mr;
    });

    mensajes = mensajes.map(m => ({
        ...m,
        username: mapaUsuarios[m.id_usuario] || 'Usuario desconocido'
    }));

    let respuesta = false;
    let mensajeRespuesta = null;
    if (req.query.id) {
        respuesta = true;
        mensajeRespuesta = Mensajes.getMensajeById(req.query.id);
        if (mensajeRespuesta) {
            mensajeRespuesta.username = mapaUsuarios[mensajeRespuesta.id_usuario] || 'Usuario desconocido';
        }
    }
    res.render('pagina', {
        contenido: 'paginas/futbol11',
        session: req.session,
        eventos,
        mensajes,
        respuesta,
        mensajeRespuesta
    });
});

//COMPETICIONES

contenidoRouter.get('/competiciones', auth, (req, res) => {

    const competiciones = Competiciones.getCompeticiones();

    competiciones.forEach(competiciones => {
        if (competiciones.genero === 'M') {
            competiciones.genero = 'Masculino';
        } else if (competiciones.genero === 'F') {
            competiciones.genero = 'Femenino';
        }
    });
    render(req, res, 'paginas/competiciones', {
        session: req.session,
        competiciones: competiciones
    });
    
});

contenidoRouter.get('/competiciones/crear', auth, (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }

    try {
        const eventos = Eventos.getEventos();
        render(req, res, 'paginas/crearCompeticion', {
            session: req.session,
            eventos: eventos,
        });
    }
    catch (e) {
        render(req, res, 'paginas/crearCompeticion', {
            session: req.session,
            eventos: [],
            error: e.message
        });
    }
});

contenidoRouter.post('/competiciones/crear', auth, [
    body('id_evento').isInt({ min: 1 }).withMessage('Debes seleccionar un evento válido'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0')
    ], (req, res) => {

    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }

    const errors = validationResult(req);
    const eventos = Eventos.getEventos();

    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/crearCompeticion', {
            eventos,
            id_evento: req.body.id_evento,
            precio: req.body.precio,
            error: errors.array().map(e => e.msg).join(', '),
            session: req.session
        });
    }

    const { id_evento, precio } = matchedData(req);

    try {
        const nuevaCompeticion = new Competiciones(id_evento, precio);
        Competiciones.persist(nuevaCompeticion);
        res.redirect('/contenido/competiciones');
    } catch (e) {
        return res.status(500).render('paginas/crearCompeticion', {
            eventos,
            id_evento,
            precio,
            error: e.message,
            session: req.session
        });
    }
});

contenidoRouter.delete('/competiciones/:id', auth, [
    param('id').isInt().withMessage('ID de competición inválido')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Requiere privilegios de administrador'
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { id } = matchedData(req);
    try {
        Competiciones.remove(id);
        res.json({ success: true });
    }
    catch (e) {
        const status = e instanceof CompeticionNoEncontrada ? 404 : 500;
        res.status(status).json({
            success: false,
            error: e.message
        });
    }
});

contenidoRouter.post('/competiciones/:id/actualizar', auth, [
    param('id').isInt().withMessage('ID de competición inválido'),
    body('evento').isInt().withMessage('Debes seleccionar un evento válido'),
    body('precio').isInt().notEmpty().withMessage('El precio de la competición es obligatorio')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).send('Acceso no autorizado');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/error', {
            error: errors.array().map(e => e.msg).join(', ')
        });
    }

    const { id, evento, nombre } = matchedData(req);
    try {
        const competicionActualizada = new Competiciones(evento, nombre, id);
        Competiciones.persist(competicionActualizada);
        res.redirect('/contenido/competiciones');
    } catch (e) {
        res.status(500).render('paginas/error', { error: e.message });
    }
});


contenidoRouter.get('/competiciones/:id/editar', auth, [
    param('id').isInt().withMessage('ID de competición inválido')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).render('paginas/noPermisos');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/error', { error: errors.array().map(e => e.msg).join(', ') });
    }
    const { id } = matchedData(req);
    try {
        const competicion = Competiciones.getCompeticionById(id);
        const eventos = Eventos.getEventos();
        render(req, res, 'paginas/editarCompeticion', {
            session: req.session,
            competicion,
            eventos,
            error: null
        });
    } catch (e) {
        render(req, res, 'paginas/editarCompeticion', {
            session: req.session,
            competicion: null,
            eventos: [],
            error: e.message
        });
    }
});

contenidoRouter.get('/competiciones/:id/datos', auth, [
    param('id').isInt().withMessage('ID de competición inválido')
], (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('paginas/error', { error: errors.array().map(e => e.msg).join(', ') });
    }
    const { id } = matchedData(req);

    try {
        const competicion = Competiciones.getCompeticionById(id);
        const apuestas = Apuestas.getApuestasByCompeticion(id);
        const usuarios = Usuario.getUsuariosByIds(apuestas.map(u => u.id_usuario));
        const evento = Eventos.getEventoById(competicion.id_evento);

        const totalApuestas = apuestas.length;

        render(req, res, 'paginas/datosCompeticion', {
            session: req.session,
            competicion,
            apuestas,
            evento,
            usuarios,
            totalApuestas,
            error: null
        });
    } catch (e) {
        render(req, res, 'paginas/datosCompeticion', {
            session: req.session,
            competicion: null,
            apuestas: [],
            evento: null,
            error: e.message
        });
    }
});

contenidoRouter.get('/competiciones/:id/apostar', auth, [
    param('id').isInt().withMessage('ID de evento inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Evento no válido');
    }
    const { id } = matchedData(req);
    try {
        const competicion = Competiciones.getCompeticionById(id);
        if (!competicion) {
            return res.status(404).send('Competicion no encontrada');
        }
        render(req, res, 'paginas/apuestaCompeticion', {
            session: req.session,
            competicion,
        });
    } catch (e) {
        return res.status(500).send('Error al obtener la competicion para participar');
    }
});

contenidoRouter.post('/competiciones/:id/apostar', auth, [
  param('id').isInt().withMessage('ID de competición inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send('Competición no válida');

  const { id } = matchedData(req);
  const id_usuario = Usuario.getIdByUsername(req.session.username);
  const {
    apuesta_ganador,
    apuesta_puntosA,
    apuesta_puntosB,
    apuesta_resultadoExacto,
    apuesta_diferenciaPuntos,
    ganador,
    puntosEquipoA,
    puntosEquipoB,
    resultadoExacto,
    diferenciaPuntos,
    multiplicador
  } = req.body;

  const competicion = Competiciones.getCompeticionById(id);

  try {

    const fondosUsuario = Usuario.getFondosById(id_usuario);

    if (competicion.precio > fondosUsuario) {
        req.session.apuestaError = 'Fondos insuficientes para unirte a la competición (' + competicion.precio + '€). Dispones de ' + fondosUsuario + '€';
        return res.redirect(req.get('referer'));
    }

    Usuario.restarFondos(id_usuario, competicion.precio);
    req.session.fondos = Usuario.getFondosById(id_usuario);

    const apuesta = {
      id_usuario,
      multiplicador: parseFloat(multiplicador) || 1,
      cantidad_apuesta: parseInt(competicion.precio, 10),
      id_competicion: id,
      id_eventos: competicion.id_evento,
      ganador: apuesta_ganador ? ganador : null,
      puntos_equipoA: apuesta_puntosA ? puntosEquipoA : null,
      puntos_equipoB: apuesta_puntosB ? puntosEquipoB : null,
      resultado_exacto: apuesta_resultadoExacto ? resultadoExacto : null,
      diferencia_puntos: apuesta_diferenciaPuntos ? diferenciaPuntos : null
    };

      const criterios = [
          apuesta_ganador,
          apuesta_puntosA,
          apuesta_puntosB,
          apuesta_resultadoExacto,
          apuesta_diferenciaPuntos
      ].filter(Boolean).length;

      apuesta.combinada = criterios > 1 ? 1 : 0;

      const evento = Eventos.getEventoById(apuesta.id_eventos);
      apuesta.fecha_fin = evento?.fecha_fin || null;
      apuesta.estado = 'pendiente';
      apuesta.ganancia = 0;

      Apuestas.insertarApuesta(apuesta);
    res.redirect('/contenido/competiciones/' + id + '/datos');

  } catch (e) {
    console.error('Error al insertar apuesta:', e);
    res.status(400).send(e.message || 'Error al insertar apuesta');
  }
});

contenidoRouter.post('/eventos/:id/resultado', auth, [
    param('id').isInt().withMessage('ID de evento inválido'),
    body('resultado_final').isString().notEmpty().withMessage('El resultado es obligatorio')
], (req, res) => {
    if (!req.session.esAdmin) {
        return res.status(403).send('No autorizado');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Datos inválidos');
    }
    const { id, resultado_final } = matchedData(req);
    try {
        Eventos.setResultadoFinal(id, resultado_final);
        Apuestas.actualizarEstadoPorEvento(id, 'finalizado');
        res.redirect('/contenido/eventos');
    } catch (e) {
        res.status(500).send('Error al guardar el resultado');
    }
});

export default contenidoRouter;




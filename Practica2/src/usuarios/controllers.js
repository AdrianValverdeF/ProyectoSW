import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { Usuario } from './Usuario.js';
import { uploadProfileImage } from '../upload.js'; 
import path from 'node:path';
import { render, renderSin } from '../utils/render.js';

export function viewLogin(req, res) {
    if(req.session.login) {
        return res.redirect('/contenido/foroComun'); 
    }
    render(req, res, 'paginas/login', {
        session: req.session 
    });
}

export function viewRegister(req, res) {
    if(req.session.login) {
        return res.redirect('/contenido/foroComun'); 
    }
    render(req, res, 'paginas/register', {
        session: req.session 
    });
}

export function doLogin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pagina', {
            contenido: 'paginas/login',
            error: 'Datos inválidos. Revisa los campos.',
            errores: errors.array(),
        });
    }

    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = Usuario.login(username, password); // Suponemos que lanza error si falla
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.apellido = usuario.apellido;
        req.session.username = usuario.username;
        req.session.edad = usuario.edad;
        req.session.esAdmin = usuario.rol === "A";
        req.session.fondos = usuario.fondos;

        return res.redirect('/contenido/foroComun');
    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/login',
            error: 'El usuario o contraseña no son válidos'
        });
    }
}

export async function doRegister(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            error: 'Datos inválidos. Revisa los campos.',
            errores: errors.array(),
            oldData: req.body,
        });
    }

    const { name, surname, username, password, age } = req.body;

    let imagePath = null;
    if (req.file) {
        imagePath = `/img/uploads/${req.file.filename}`;
    }

    try {
        const usuario = Usuario.register(username, password, name, surname, parseInt(age));
        Usuario.insertImagen(usuario.id, imagePath);

        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.apellido = usuario.apellido;
        req.session.username = usuario.username;
        req.session.edad = usuario.edad;
        req.session.esAdmin = usuario.rol === "A";
        req.session.fondos = usuario.fondos;
        req.session.imagePath = { rutaImg: imagePath };

        return res.render('pagina', {
            contenido: 'paginas/foroComun',
            session: req.session
        });

    } catch (e) {
        if (req.file) {
            fs.unlinkSync(path.join('static', 'img', 'uploads', req.file.filename));
        }

        return res.render('pagina', {
            contenido: 'paginas/register',
            error: e.message || 'Error en el registro',
            oldData: req.body
        });
    }
}

export async function updateProfile(req, res) {
    const { name, surname, age, username } = req.body;

    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        usuario.nombre = name;
        usuario.apellido = surname;
        usuario.edad = parseInt(age);
        usuario.username = username;

        // Procesar nueva imagen si se subió
        if (req.file) {
            // Eliminar la imagen anterior si existe
            if (usuario.rutaimg) {
                const fs = await import('node:fs');
                const oldImagePath = path.join('static', usuario.rutaimg.replace('/img/', ''));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            // Guardar la nueva imagen
            const imagePath = `/img/${req.file.filename}`;
            usuario.rutaimg = imagePath;
            req.session.imagePath = imagePath;
        }

        usuario.persist();

        // Actualizar datos de sesión
        req.session.nombre = name;
        req.session.apellido = surname;
        req.session.edad = parseInt(age);
        req.session.username = username;

        res.redirect('/contenido/perfil');
    } catch (e) {
        console.error('Error al actualizar el perfil:', e);
        
        // Eliminar la imagen subida si hubo un error
        if (req.file) {
            const fs = await import('node:fs');
            fs.unlinkSync(path.join('static', req.file.filename));
        }
        
        res.render('paginaSinSidebar', {
            contenido: 'paginas/perfil',
            session: req.session,
            mostrarFormulario: true,
            error: 'Error al actualizar el perfil. Inténtalo de nuevo.'
        });
    }
}


export function doLogout(req, res, next) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar la sesión');
        }
        res.redirect('/');
    });
}






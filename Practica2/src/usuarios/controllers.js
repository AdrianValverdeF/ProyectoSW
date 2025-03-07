import { body } from 'express-validator';
import { Usuario } from './usuario.js';

export function viewLogin(req, res) {
    res.render('pagina', { 
        contenido: 'paginas/login', 
        session: req.session 
    });
}
export function doLogin(req, res) {
    body('username').escape(); // Se asegura que eliminar caracteres problemáticos
    body('password').escape(); // Se asegura que eliminar caracteres problemáticos
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = Usuario.login(username, password);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.esAdmin = usuario.rol === "A";
        return res.render('pagina', {
            contenido: 'paginas/foroComun',
            session: req.session
        });

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/login',
            error: 'El usuario o contraseña no son válidos'
        })
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

import { body } from 'express-validator';

export function viewLogin(req, res) {
    res.render('pagina', { 
        contenido: 'paginas/login', 
        session: req.session 
    });
}
export function doLogin(req, res) {
    body('username').escape(); // Se asegura que eliminar caracteres problemáticos
    body('password').escape(); // Se asegura que eliminar caracteres problemáticos
    const { username, password } = req.body;

    if (username === 'Paco' && password === 'sanchez2025') {
        req.session.login = true;
        req.session.nombre = 'Paco';
        req.session.esAdmin = false;
        res.redirect('/contenido/normal');
    } else if (username === 'admin' && password === 'adminpass') {
        req.session.login = true;
        req.session.nombre = 'Administrador';
        req.session.esAdmin = true;
        res.redirect('/contenido/admin');
    } else {
        
        res.status(401).render('pagina', {
            error: 'Usuario o contraseña incorrectos',
            contenido:'paginas/errLogin',
            session: req.session
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

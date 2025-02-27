import { body } from 'express-validator';

export function viewLogin(req, res) {
    res.render('pagina', { 
        contenido: 'paginas/login', // Ruta relativa a la vista de login
        session: req.session // Pasar la sesión si es necesario
    });
}
export function doLogin(req, res) {
    body('username').escape(); // Se asegura que eliminar caracteres problemáticos
    body('password').escape(); // Se asegura que eliminar caracteres problemáticos
    // TODO: tu código aquí
}

export function doLogout(req, res, next) {
    // TODO: https://expressjs.com/en/resources/middleware/session.html
}

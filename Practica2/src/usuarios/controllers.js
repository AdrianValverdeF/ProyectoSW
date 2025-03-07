import { body } from 'express-validator';
import { Usuario } from './usuario.js';

export function viewLogin(req, res) {
    res.render('pagina', { 
        contenido: 'paginas/login', 
        session: req.session 
    });
}

export function viewRegister(req, res) {
    res.render('pagina', { 
        contenido: 'paginas/register', 
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
        req.session.apellido = usuario.apellido;
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

export function doRegister(req, res) {

    body('name').trim().escape().notEmpty().withMessage('Nombre requerido');
    body('surname').trim().escape().notEmpty().withMessage('Apellido requerido');
    body('username').trim().escape().notEmpty().withMessage('Usuario requerido');
    body('password').trim().escape().notEmpty().withMessage('Contraseña requerida');
    body('age').trim().escape().notEmpty().withMessage('Edad requerida').isInt({ min: 1 }).withMessage('Edad debe ser un número válido').custom((value) => {
            if (parseInt(value) < 18) {
                throw new Error('Debes tener al menos 18 años para registrarte');
            }
            return true;
        });

   // const errors = validationResult(req);
    /*if (!errors.isEmpty()) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            error: 'Datos de entrada no válidos',
            errors: errors.array()
        });
    }
*/
    const { name, surname, username, password, age } = req.body;

    try {
        const usuario = Usuario.register(username, password, name, surname, parseInt(age));

        req.session.login = true;
        req.session.nombre = usuario.nombre;

        return res.render('pagina', {
            contenido: 'paginas/foroComun',
            session: req.session
        });
    } catch (e) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            error: e.message || 'Error en el registro'
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

import express from 'express';
import { body } from 'express-validator';
import { viewLogin, doLogin, doLogout,viewRegister,doRegister,updateProfile } from './controllers.js';
import { uploadProfileImage } from '../upload.js'; 

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es obligatorio'),
    body('password')
      .notEmpty().withMessage('La contraseña no puede estar vacía')
  ], doLogin); // Manejar el envío del formulario de login

const registerValidators = [
body('name').trim().escape().notEmpty().withMessage('Nombre requerido'),
body('surname').trim().escape().notEmpty().withMessage('Apellido requerido'),
body('username').trim().escape().notEmpty().withMessage('Usuario requerido'),
body('password').trim().escape().notEmpty().withMessage('Contraseña requerida'),
body('age')
    .trim()
    .escape()
    .notEmpty().withMessage('Edad requerida')
    .isInt({ min: 1 }).withMessage('Edad debe ser un número válido')
    .custom(value => {
        if (parseInt(value) < 18) {
            throw new Error('Debes tener al menos 18 años');
        }
        return true;
    })
];

usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', uploadProfileImage, registerValidators, doRegister); // Manejar el envío del formulario de register
usuariosRouter.get('/logout', doLogout); // Manejar el cierre de sesión
usuariosRouter.post('/update-profile', uploadProfileImage, updateProfile); // Manejar la actualización del perfil

export default usuariosRouter;
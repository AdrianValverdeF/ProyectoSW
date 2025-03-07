import express from 'express';
import { viewLogin, doLogin, doLogout,viewRegister,doRegister } from './controllers.js';

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin); // Manejar el envío del formulario de login
usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', doRegister); // Manejar el envío del formulario de register
usuariosRouter.get('/logout', doLogout); // Manejar el cierre de sesión

export default usuariosRouter;
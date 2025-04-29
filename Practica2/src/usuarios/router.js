import express from 'express';
import { viewLogin, doLogin, doLogout,viewRegister,doRegister,updateProfile } from './controllers.js';
import { uploadProfileImage } from '../upload.js'; 

const usuariosRouter = express.Router();

// /usuarios/login
usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin); // Manejar el envío del formulario de login
usuariosRouter.get('/register', viewRegister);
usuariosRouter.post('/register', uploadProfileImage,doRegister); // Manejar el envío del formulario de register
usuariosRouter.get('/logout', doLogout); // Manejar el cierre de sesión
usuariosRouter.post('/update-profile', uploadProfileImage, updateProfile); // Manejar la actualización del perfil

export default usuariosRouter;
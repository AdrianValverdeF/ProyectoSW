import { Usuario } from "./usuarios/Usuario.js";
import { Chat } from './contenido/chat.js';



export function inicializaModelos(db) {
    Usuario.initStatements(db);
 //   Chat.initStatements(db);

}
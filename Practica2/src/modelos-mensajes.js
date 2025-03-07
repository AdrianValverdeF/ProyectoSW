import { Mensajes } from "./contenido/mensajes.js";

export function inicializarMensajes(db) {
    Mensajes.initStatementsMensajes(db);
}
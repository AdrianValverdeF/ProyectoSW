import { Usuario } from "./usuarios/usuario.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
}
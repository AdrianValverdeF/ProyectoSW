import { Usuario } from "./usuarios/Usuario.js";
import { Eventos } from "./contenido/eventos.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Eventos.initStatementsEventos(db);
}
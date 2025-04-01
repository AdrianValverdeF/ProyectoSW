import { Usuario } from "./usuarios/Usuario.js";
import { Eventos } from "./contenido/eventos.js";
import { Equipos } from "./contenido/equipos.js";


export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Eventos.initStatements(db);
    Equipos.initStatements(db);
}
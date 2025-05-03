import { Usuario } from "./usuarios/Usuario.js";
import { Eventos } from "./contenido/eventos.js";
import { Equipos } from "./contenido/equipos.js";
import { MisApuestas } from './contenido/misApuestas.js';
import { Apuestas } from './contenido/apuestas.js';
import { Amigos } from "./usuarios/Amigos.js";



export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Eventos.initStatements(db);
    Equipos.initStatements(db);
    MisApuestas.initStatements(db); 
    Apuestas.initStatements(db);
    Amigos.initStatements(db);
}
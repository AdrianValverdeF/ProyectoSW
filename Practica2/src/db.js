import { join, dirname } from "node:path";
import Database from 'better-sqlite3';

let db = null;

function createConnection() {
    const options = {
        verbose: console.log // Opcional y sólo recomendable durante desarrollo.
    };
    const db = new Database(join(dirname(import.meta.dirname), 'data', 'aw_sw.db'), options);
    db.pragma('journal_mode = WAL');
    return db;
}

export function getConnection() {
    if (db !== null) return db;
    db = createConnection();
    return db;
}

export function checkConnection(db = getConnection()) {
    const checkStmt = db.prepare('SELECT 1+1 as suma');
    const suma = checkStmt.get().suma;
    if (suma == null || suma !== 2) throw Error(`La bbdd no funciona correctamente`);
}

export function closeConnection(db = getConnection()) {
    if (db === null) return;
    db.close();
}
export class MisApuestas {
    static #getByUserIdStmt = null;

    static initStatements(db) {
        if (this.#getByUserIdStmt !== null) return;

        this.#getByUserIdStmt = db.prepare(`
            SELECT 
                Apuestas.id, 
                Apuestas.cantidad_apuesta, 
                Apuestas.multiplicador, 
                Apuestas.combinada, 
                Eventos.equipoA, 
                Eventos.equipoB, 
                Eventos.fecha
            FROM Apuestas
            JOIN Eventos ON Eventos.id = Apuestas.id_eventos
            WHERE Apuestas.id_usuario = ?
        `);
    }

    static getByUserId(id_usuario) {
        try {
            return this.#getByUserIdStmt.all(id_usuario);
        } catch (e) {
            throw new Error('No se han podido obtener las apuestas del usuario', { cause: e });
        }
    }
}
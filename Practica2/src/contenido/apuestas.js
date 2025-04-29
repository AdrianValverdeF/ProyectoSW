export class Apuestas {
    static #insertStmt = null;

    static initStatements(db) {
        if (this.#insertStmt !== null) return;
        this.#insertStmt = db.prepare(`
            INSERT INTO Apuestas (id_usuario, multiplicador, cantidad_apuesta, id_eventos, combinada)
            VALUES (@id_usuario, @multiplicador, @cantidad_apuesta, @id_eventos, @combinada)
        `);
    }

    static insertarApuesta(apuesta) {
        this.#insertStmt.run(apuesta);
    }
}
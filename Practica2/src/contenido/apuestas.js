export class Apuestas {
    static #insertStmt = null;

    static initStatements(db) {
        if (this.#insertStmt !== null) return;
        this.#insertStmt = db.prepare(`
            INSERT INTO Apuestas (
                id_usuario, multiplicador, cantidad_apuesta, id_eventos, combinada,
                ganador, resultado_exacto, diferencia_puntos, puntos_equipoA, puntos_equipoB
            )
            VALUES (
                @id_usuario, @multiplicador, @cantidad_apuesta, @id_eventos, @combinada,
                @ganador, @resultado_exacto, @diferencia_puntos, @puntos_equipoA, @puntos_equipoB
            )
        `);
    }

    static insertarApuesta(apuesta) {
        this.#insertStmt.run(apuesta);
    }
}
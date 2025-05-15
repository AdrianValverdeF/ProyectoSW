export class Apuestas {
    static #insertStmt = null;
    static #selectByCompeticionStmt = null;

    static initStatements(db) {
        if (this.#insertStmt !== null) return;

        this.#insertStmt = db.prepare(`
            INSERT INTO Apuestas (
                id_usuario, multiplicador, cantidad_apuesta, id_eventos, combinada,
                ganador, resultado_exacto, diferencia_puntos, puntos_equipoA, puntos_equipoB,
                id_competicion
            )
            VALUES (
                @id_usuario, @multiplicador, @cantidad_apuesta, @id_eventos, @combinada,
                @ganador, @resultado_exacto, @diferencia_puntos, @puntos_equipoA, @puntos_equipoB,
                @id_competicion
            )
        `);

        this.#selectByCompeticionStmt = db.prepare(`
            SELECT * FROM Apuestas WHERE id_competicion = ? ORDER BY multiplicador DESC
        `);
    }

    static insertarApuesta(apuesta) {
        this.#insertStmt.run(apuesta);
    }

    static getApuestasByCompeticion(id_competicion) {
        const apuestas = this.#selectByCompeticionStmt.all(id_competicion);
        return apuestas.map(row => new Apuestas(row));
    }


    constructor({id, id_usuario, multiplicador, cantidad_apuesta, id_eventos,
        combinada, ganador, resultado_exacto, diferencia_puntos, puntos_equipoA, puntos_equipoB,
        id_competicion }) {

        this.id = id;
        this.id_usuario = id_usuario;
        this.multiplicador = multiplicador;
        this.cantidad_apuesta = cantidad_apuesta;
        this.id_eventos = id_eventos;
        this.combinada = combinada;
        this.ganador = ganador;
        this.resultado_exacto = resultado_exacto;
        this.diferencia_puntos = diferencia_puntos;
        this.puntos_equipoA = puntos_equipoA;
        this.puntos_equipoB = puntos_equipoB;
        this.id_competicion = id_competicion;
    }
}

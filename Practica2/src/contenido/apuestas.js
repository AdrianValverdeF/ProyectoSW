export class Apuestas {
    static #insertStmt = null;
    static #selectByCompeticionStmt = null;
    static #deleteByIdStmt = null;
    static #db = null;

    static initStatements(db) {
        if (this.#insertStmt !== null) return;
        this.#db = db;

        this.#insertStmt = db.prepare(`
            INSERT INTO Apuestas (
                id_usuario, multiplicador, cantidad_apuesta, id_eventos, combinada,
                ganador, resultado_exacto, diferencia_puntos, puntos_equipoA, puntos_equipoB,
                id_competicion, estado, ganancia
            )
            VALUES (
                @id_usuario, @multiplicador, @cantidad_apuesta, @id_eventos, @combinada,
                @ganador, @resultado_exacto, @diferencia_puntos, @puntos_equipoA, @puntos_equipoB,
                @id_competicion, @estado, @ganancia
            )
        `);

        this.#selectByCompeticionStmt = db.prepare(`
            SELECT * FROM Apuestas WHERE id_competicion = ? ORDER BY multiplicador DESC
        `);

        this.#deleteByIdStmt = db.prepare(`
            DELETE FROM Apuestas WHERE id = ?
        `);
    }

    static insertarApuesta(apuesta) {
        this.#insertStmt.run(apuesta);
    }

    static getApuestasByCompeticion(id_competicion) {
        const apuestas = this.#selectByCompeticionStmt.all(id_competicion);
        return apuestas.map(row => new Apuestas(row));
    }

    static actualizarEstadoPorEvento(id_eventos, nuevoEstado) {
        const stmt = this.#db.prepare('UPDATE Apuestas SET estado = ? WHERE id_eventos = ?');
        stmt.run(nuevoEstado, id_eventos);
    }

    static eliminarApuestaPorId(id) {
        this.#deleteByIdStmt.run(id);
    }

    static actualizarEstadosGlobal() {
        const stmt2 = this.#db.prepare(`
            UPDATE Apuestas
            SET estado = 'finalizado'
            WHERE id_eventos IN (
                SELECT e.id FROM Eventos e
                WHERE datetime(e.fecha) < datetime('now')
                AND (e.resultado_final IS NOT NULL AND TRIM(e.resultado_final) != '')
            )
            AND estado != 'finalizado'
        `);
        stmt2.run();

        const stmt = this.#db.prepare(`
            UPDATE Apuestas
            SET estado = 'sin resultado'
            WHERE id_eventos IN (
                SELECT e.id FROM Eventos e
                WHERE datetime(e.fecha) < datetime('now')
                AND (e.resultado_final IS NULL OR TRIM(e.resultado_final) = '')
            )
            AND estado != 'sin resultado'
        `);
        stmt.run();

        const stmt3 = this.#db.prepare(`
            UPDATE Apuestas
            SET estado = 'pendiente'
            WHERE id_eventos IN (
                SELECT e.id FROM Eventos e
                WHERE datetime(e.fecha) > datetime('now')
            )
            AND estado != 'pendiente'
        `);
        stmt3.run();
    }

    constructor({id, id_usuario, multiplicador, cantidad_apuesta, id_eventos,
        combinada, ganador, resultado_exacto, diferencia_puntos, puntos_equipoA, puntos_equipoB,
        id_competicion, estado = 'pendiente', ganancia = 0 }) {

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
        this.estado = estado;
        this.ganancia = ganancia;
    }
}

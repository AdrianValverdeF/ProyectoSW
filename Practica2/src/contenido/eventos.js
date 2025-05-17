export class Eventos {
    static #getAllStmt = null;
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #db = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;
        this.#db = db;

        this.#getAllStmt = db.prepare(`
            SELECT e.id, e.fecha, e.deporte, 
                   eqA.nombre AS equipoA_nombre, eqB.nombre AS equipoB_nombre,
                   eqA.genero AS genero,
                   e.resultado_final
            FROM Eventos e 
            LEFT JOIN Equipos eqA ON e.equipoA = eqA.id 
            LEFT JOIN Equipos eqB ON e.equipoB = eqB.id
            ORDER BY e.fecha ASC
        `);

        this.#getByIdStmt = db.prepare(`
            SELECT e.id, e.fecha, e.deporte, 
                   eqA.nombre AS equipoA_nombre, eqB.nombre AS equipoB_nombre,
                   eqA.genero AS genero,
                   e.resultado_final
            FROM Eventos e 
            LEFT JOIN Equipos eqA ON e.equipoA = eqA.id 
            LEFT JOIN Equipos eqB ON e.equipoB = eqB.id
            WHERE e.id = ?
        `);

        this.#insertStmt = db.prepare(`
            INSERT INTO Eventos (equipoA, equipoB, deporte, fecha) 
            VALUES (@equipoA, @equipoB, @deporte, @fecha)
        `);

        this.#updateStmt = db.prepare(`
            UPDATE Eventos 
            SET equipoA = @equipoA, equipoB = @equipoB, 
                deporte = @deporte, fecha = @fecha 
            WHERE id = @id
        `);

        this.#deleteStmt = db.prepare('DELETE FROM Eventos WHERE id = @id');
    }


    static getEventos() {
        try {
            const result = this.#getAllStmt.all();
            return result.map(row => new Eventos(
                row.equipoA_nombre, row.equipoB_nombre, row.deporte, row.fecha, row.id, row.genero, row.resultado_final
            ));
        } catch (e) {
            throw new ErrorDatos('No se han encontrado eventos', { cause: e });
        }
    }

    static getEventoById(id) {
        try {
            const row = this.#getByIdStmt.get(id);
            if (!row) throw new EventoNoEncontrado(id);

            return new Eventos(
                row.equipoA_nombre, row.equipoB_nombre, row.deporte, row.fecha, row.id, row.genero, row.resultado_final
            );

        } catch (e) {
            if (e instanceof EventoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al buscar evento con ID ${id}`, { cause: e });
        }
    }

    static #insert(evento) {
        try {
            const { equipoA, equipoB, deporte, fecha } = evento;
            const datos = { equipoA, equipoB, deporte, fecha };

            const result = this.#insertStmt.run(datos);
            evento.id = result.lastInsertRowid;

            return evento;
        } catch (e) {
            throw new ErrorDatos('No se ha podido insertar el evento', { cause: e });
        }
    }

    static #update(evento) {
        try {
            const { equipoA, equipoB, deporte, fecha, id } = evento;
            const datos = { equipoA, equipoB, deporte, fecha, id };

            const result = this.#updateStmt.run(datos);
            if (result.changes === 0) throw new EventoNoEncontrado(id);

            return evento;
        } catch (e) {
            if (e instanceof EventoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al actualizar evento con ID ${evento.id}`, { cause: e });
        }
    }

    static #delete(id) {
        try {
            const result = this.#deleteStmt.run({ id });
            if (result.changes === 0) throw new EventoNoEncontrado(id);
        } catch (e) {
            if (e instanceof EventoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al eliminar evento con ID ${id}`, { cause: e });
        }
    }

    static persist(evento) {
        if (evento.id === undefined || evento.id === null) {
            return Eventos.#insert(evento);
        } else {
            return Eventos.#update(evento);
        }
    }

    static remove(id) {
        try {
            const result = this.#deleteStmt.run({ id });
            if (result.changes === 0) {
                throw new EventoNoEncontrado(id);
            }
            return true;
        } catch (e) {
            if (e instanceof EventoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al eliminar evento: ${e.message}`);
        }
    }

    static setResultadoFinal(id, resultado_final) {
        const stmt = this.#db.prepare('UPDATE Eventos SET resultado_final = ? WHERE id = ?');
        stmt.run(resultado_final, id);
    }

    constructor(equipoA, equipoB, deporte, fecha = new Date(), id = null, genero = null, resultado_final = null) {
        this.equipoA = equipoA;
        this.equipoB = equipoB;
        this.deporte = deporte;
        this.fecha = fecha;
        this.id = id;
        this.genero = genero;
        this.resultado_final = resultado_final;
    }
}

export class EventoNoEncontrado extends Error {
    /**
     * @param {number} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`Evento no encontrado: ${id}`, options);
        this.name = 'EventoNoEncontrado';
    }
}

export class ErrorDatos extends Error {
    /**
     * @param {string} message 
     * @param {ErrorOptions} [options]
     */
    constructor(message, options) {
        super(message, options);
        this.name = 'ErrorDatos';
    }
}
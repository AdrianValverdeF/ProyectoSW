export class Eventos {
    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatementsEventos(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare('SELECT e.id, e.fecha,e.deporte, eqA.nombre AS equipoA_nombre, eqB.nombre AS equipoB_nombre FROM Eventos e LEFT JOIN Equipos eqA ON e.equipoA = eqA.id LEFT JOIN Equipos eqB ON e.equipoB = eqB.id');
        this.#insertStmt = db.prepare('INSERT INTO Eventos (equipoA, equipoB, deporte, fecha) VALUES (@equipoA, @equipoB, @deporte, @fecha)');
        this.#updateStmt = db.prepare('UPDATE Eventos SET equipoA = @equipoA, equipoB = @equipoB, deporte = @deporte, fecha = @fecha WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Eventos WHERE id = @id');
    }

    static getEventos() {
        let result = null;
        try {
            result = this.#getAllStmt.all();
        }
        catch (e) {
            throw new ErrorDatos('No se han encontrado eventos', { cause: e });
        }

        return result.map(row => new Eventos(row.equipoA_nombre, row.equipoB_nombre, row.deporte, row.fecha, row.id));
    }

    static #insert(evento) {
        let result = null;
        try {
            const { equipoA, equipoB, deporte, fecha } = evento;
            const datos = { equipoA, equipoB, deporte, fecha };

            result = this.#insertStmt.run(datos);

            evento.id = result.lastInsertRowid;
        } catch (e) {
            throw new ErrorDatos('No se ha insertado el evento', { cause: e });
        }
        return evento;
    }

    static #update(evento) {
        const { equipoA, equipoB, deporte, fecha, id } = evento;
        const datos = { equipoA, equipoB, deporte, fecha, id };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new EventoNoEncontrado(id);

        return evento;
    }

    static #delete(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new EventoNoEncontrado(id);
    }

    static persist(evento) {
        if (evento.id === undefined || evento.id === null) {
            return Eventos.#insert(evento);
        } else {
            return Eventos.#update(evento);
        }
    }

    static remove(id) {
        return Eventos.#delete(id);
    }

    constructor(equipoA, equipoB, deporte, fecha = new Date(), id = null) {
        this.equipoA = equipoA;
        this.equipoB = equipoB;
        this.deporte = deporte;
        this.fecha = fecha;
        this.id = id;
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
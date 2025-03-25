export class Eventos {
    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatementsEventos(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare('SELECT * FROM Eventos');
        this.#insertStmt = db.prepare('INSERT INTO Eventos (equipoA, equipoB, deporte, fecha) VALUES (@equipoA, @equipoB, @deporte, @fecha)');
        this.#updateStmt = db.prepare('UPDATE Eventos SET equipoA = @equipoA, equipoB = @equipoB, deporte = @deporte, fecha = @fecha WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Eventos WHERE id = @id');
    }

    static getEventos() {
        try {
            const result = this.#getAllStmt.all();
            if (result.length === 0) {
                return [];
            }
            return result.map(row => new Eventos(
                row.equipoA,
                row.equipoB,
                row.deporte,
                row.fecha,
                row.id
            ));
        } catch (e) {
            throw new ErrorDatos('Error retrieving events', { cause: e });
        }
    }



    static #insert(mensaje) {
        let result = null;
        try {
            const { mensaje: contenido, id_usuario, created_at, id_mensaje_respuesta, id_foro } = mensaje;
            const datos = { mensaje: contenido, id_usuario, created_at, id_mensaje_respuesta, id_foro };

            result = this.#insertStmt.run(datos);

            mensaje.id = result.lastInsertRowid;
        } catch (e) {
            throw new ErrorDatos('No se ha insertado el evento', { cause: e });
        }
        return mensaje;
    }

    static #update(mensaje) {
        const { mensaje: contenido, autor, id_foro, id_mensaje_respuesta, id } = mensaje;
        const datos = { mensaje: contenido, autor, id_foro, id_mensaje_respuesta, id };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new MensajeNoEncontrado(id);

        return mensaje;
    }

    static #delete(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new MensajeNoEncontrado(id);
    }

    static persist(mensaje) {

        return Mensajes.#insert(mensaje)

    }

    static remove(id) {
        return Mensajes.#delete(id);
    }

    constructor(mensaje, id_usuario, created_at = new Date(), id_mensaje_respuesta = null, id_foro = null, id = null) {
        this.mensaje = mensaje;
        this.id_usuario = id_usuario;
        this.created_at = created_at;
        this.id_mensaje_respuesta = id_mensaje_respuesta;
        this.id_foro = id_foro;
        this.id = id;
    }
}

export class EventoNoEncontrado extends Error {
    /**
     * 
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
     * 
     * @param {string} message 
     * @param {ErrorOptions} [options]
     */
    constructor(message, options) {
        super(message, options);
        this.name = 'ErrorDatos';
    }
}
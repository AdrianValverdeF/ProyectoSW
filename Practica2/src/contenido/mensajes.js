export class Mensajes {
    static #getByNearestDateStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getByNearestDateStmt !== null) return;

        this.#getByNearestDateStmt = db.prepare('SELECT * FROM Mensajes ORDER BY created_at DESC');
        this.#insertStmt = db.prepare('INSERT INTO Mensajes(mensaje, id_usuario, created_at, id_mensaje_respuesta, id_foro) VALUES (@mensaje, @id_usuario, @created_at, @id_mensaje_respuesta, @id_foro)');
        this.#updateStmt = db.prepare('UPDATE Mensajes SET mensaje = @mensaje, autor = @autor, id_foro = @id_foro, id_mensaje_respuesta = @id_mensaje_respuesta WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Mensajes WHERE id = @id');
    }

    static getMensajes() {
        return this.#getByNearestDateStmt.all();
    }

    static #insert(mensaje) {
        let result = null;
        try {
            const { mensaje: contenido, id_usuario, created_at, id_mensaje_respuesta, id_foro } = mensaje;
            const datos = { mensaje: contenido, id_usuario, created_at, id_mensaje_respuesta, id_foro };

            result = this.#insertStmt.run(datos);

            mensaje.id = result.lastInsertRowid;
        } catch (e) {
            throw new ErrorDatos('No se ha insertado el mensaje', { cause: e });
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
        if (mensaje.id === null) return Mensajes.#insert(mensaje);
        return Mensajes.#update(mensaje);
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

export class MensajeNoEncontrado extends Error {
    /**
     * 
     * @param {number} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`Mensaje no encontrado: ${id}`, options);
        this.name = 'MensajeNoEncontrado';
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
import { ErrorDatos } from '../db.js';

export class Chat {
    static #getByAmigoStmt = null;
    static #insertStmt = null;

    static initStatements(db) {
        if (this.#getByAmigoStmt !== null) return;

        this.#getByAmigoStmt = db.prepare('SELECT * FROM Chat WHERE (id_usuario = @id_usuario AND id_amigo = @id_amigo) OR (id_usuario = @id_amigo AND id_amigo = @id_usuario) ORDER BY created_at ASC');
        this.#insertStmt = db.prepare('INSERT INTO Chat(mensaje, id_usuario, id_amigo, created_at) VALUES (@mensaje, @id_usuario, @id_amigo, @created_at)');
    }

    static getMensajesByAmigo(id_usuario, id_amigo) {
        const mensajes = this.#getByAmigoStmt.all({ id_usuario, id_amigo });
        return mensajes.map(row => new Chat(row.mensaje, row.id_usuario, row.id_amigo, row.created_at, row.id));
    }

    static #insert(mensaje) {
        let result = null;
        try {
            const { mensaje: contenido, id_usuario, id_amigo, created_at } = mensaje;
            const datos = { mensaje: contenido, id_usuario, id_amigo, created_at: new Date().toISOString() };

            result = this.#insertStmt.run(datos);
            mensaje.id = result.lastInsertRowid;
        } catch (e) {
            throw new ErrorDatos('No se ha insertado el mensaje', { cause: e });
        }
        return mensaje;
    }

    static persist(mensaje) {
        return Chat.#insert(mensaje);
    }

    constructor(mensaje, id_usuario, id_amigo, created_at = new Date(), id = null) {
        this.mensaje = mensaje;
        this.id_usuario = id_usuario;
        this.id_amigo = id_amigo;
        this.created_at = created_at;
        this.id = id;
    }
}
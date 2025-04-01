export class Equipos {
    static #getAllStmt = null;
    static #getByIdStmt = null;
    static #getByNameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare(`
            SELECT id, nombre, victorias, derrotas, empates, puntos 
            FROM Equipos 
            ORDER BY nombre ASC
        `);

        this.#getByIdStmt = db.prepare(`
            SELECT id, nombre, victorias, derrotas, empates, puntos 
            FROM Equipos 
            WHERE id = ?
        `);

        this.#getByNameStmt = db.prepare(`
            SELECT id, nombre, victorias, derrotas, empates, puntos 
            FROM Equipos 
            WHERE nombre = ?
        `);

        this.#insertStmt = db.prepare(`
            INSERT INTO Equipos (nombre, victorias, derrotas, empates, puntos) 
            VALUES (@nombre, @victorias, @derrotas, @empates, @puntos)
        `);

        this.#updateStmt = db.prepare(`
            UPDATE Equipos 
            SET nombre = @nombre, 
                victorias = @victorias, 
                derrotas = @derrotas, 
                empates = @empates, 
                puntos = @puntos 
            WHERE id = @id
        `);

        this.#deleteStmt = db.prepare('DELETE FROM Equipos WHERE id = ?');
    }

    static getAll() {
        try {
            return this.#getAllStmt.all();
        } catch (e) {
            throw new ErrorDatos('No se han podido obtener los equipos', { cause: e });
        }
    }

    static getById(id) {
        try {
            const equipo = this.#getByIdStmt.get(id);
            if (!equipo) throw new EquipoNoEncontrado(id);
            return equipo;
        } catch (e) {
            if (e instanceof EquipoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al buscar equipo con ID ${id}`, { cause: e });
        }
    }

    static getByName(nombre) {
        try {
            const equipo = this.#getByNameStmt.get(nombre);
            if (!equipo) throw new EquipoNoEncontrado(nombre);
            return equipo;
        } catch (e) {
            if (e instanceof EquipoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al buscar equipo: ${nombre}`, { cause: e });
        }
    }

    static getIdByName(nombre) {
        try {
            const equipo = this.#getByNameStmt.get(nombre);
            if (!equipo) throw new EquipoNoEncontrado(nombre);
            return equipo.id;
        } catch (e) {
            if (e instanceof EquipoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al obtener ID del equipo: ${nombre}`, { cause: e });
        }
    }

    static create(nombre, victorias = 0, derrotas = 0, empates = 0, puntos = 0) {
        try {
            const result = this.#insertStmt.run({
                nombre,
                victorias,
                derrotas,
                empates,
                puntos
            });
            return new Equipos(nombre, victorias, derrotas, empates, puntos, result.lastInsertRowid);
        } catch (e) {
            throw new ErrorDatos('No se ha podido crear el equipo', { cause: e });
        }
    }

    static update(id, nombre, victorias, derrotas, empates, puntos) {
        try {
            const result = this.#updateStmt.run({
                id,
                nombre,
                victorias,
                derrotas,
                empates,
                puntos
            });
            if (result.changes === 0) throw new EquipoNoEncontrado(id);
            return true;
        } catch (e) {
            if (e instanceof EquipoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al actualizar equipo con ID ${id}`, { cause: e });
        }
    }

    static delete(id) {
        try {
            const result = this.#deleteStmt.run(id);
            if (result.changes === 0) throw new EquipoNoEncontrado(id);
            return true;
        } catch (e) {
            if (e instanceof EquipoNoEncontrado) throw e;
            throw new ErrorDatos(`Error al eliminar equipo con ID ${id}`, { cause: e });
        }
    }

    constructor(nombre, victorias = 0, derrotas = 0, empates = 0, puntos = 0, id = null) {
        this.id = id;
        this.nombre = nombre;
        this.victorias = victorias;
        this.derrotas = derrotas;
        this.empates = empates;
        this.puntos = puntos;
    }
}

export class EquipoNoEncontrado extends Error {
    constructor(idOrName, options) {
        super(`Equipo no encontrado: ${idOrName}`, options);
        this.name = 'EquipoNoEncontrado';
    }
}

export class ErrorDatos extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'ErrorDatos';
    }
}
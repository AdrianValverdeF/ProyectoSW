export class Competiciones {
    static #getAllStmt = null;
    static #getByIdStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #getByEventoStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare(`
            SELECT c.id, c.precio, c.id_evento,
                   e.fecha, e.deporte,
                   eqA.nombre AS equipoA_nombre, eqB.nombre AS equipoB_nombre,
                   eqA.genero AS genero
            FROM Competiciones c
            JOIN Eventos e ON c.id_evento = e.id
            LEFT JOIN Equipos eqA ON e.equipoA = eqA.id
            LEFT JOIN Equipos eqB ON e.equipoB = eqB.id
            ORDER BY e.fecha ASC
        `);

        this.#getByIdStmt = db.prepare(`
            SELECT c.id, c.precio, c.id_evento,
                   e.fecha, e.deporte,
                   eqA.nombre AS equipoA_nombre, eqB.nombre AS equipoB_nombre,
                   eqA.genero AS genero
            FROM Competiciones c
            JOIN Eventos e ON c.id_evento = e.id
            LEFT JOIN Equipos eqA ON e.equipoA = eqA.id
            LEFT JOIN Equipos eqB ON e.equipoB = eqB.id
            WHERE c.id = ?
        `);

        this.#insertStmt = db.prepare(`
            INSERT INTO Competiciones (id_evento, precio)
            VALUES (@id_evento, @precio)
        `);

        this.#updateStmt = db.prepare(`
            UPDATE Competiciones
            SET id_evento = @id_evento, precio = @precio
            WHERE id = @id
        `);

        this.#getByEventoStmt = db.prepare(`
            SELECT c.id, c.precio, c.id_evento,
                e.fecha, e.deporte,
                eqA.nombre AS equipoA_nombre, eqB.nombre AS equipoB_nombre,
                eqA.genero AS genero
            FROM Competiciones c
            JOIN Eventos e ON c.id_evento = e.id
            LEFT JOIN Equipos eqA ON e.equipoA = eqA.id
            LEFT JOIN Equipos eqB ON e.equipoB = eqB.id
            WHERE c.id_evento = ?
            ORDER BY e.fecha ASC
        `);

        this.#deleteStmt = db.prepare('DELETE FROM Competiciones WHERE id = @id');
    }

    static getCompeticiones() {
        try {
            const result = this.#getAllStmt.all();
            return result.map(row => new Competiciones(
                row.id_evento, row.precio, row.id,
                row.equipoA_nombre, row.equipoB_nombre, row.deporte, row.fecha, row.genero
            ));
        } catch (e) {
            throw new ErrorDatos('No se han encontrado competiciones', { cause: e });
        }
    }

    static getCompeticionById(id) {
        try {
            const row = this.#getByIdStmt.get(id);
            if (!row) throw new CompeticionNoEncontrada(id);

            return new Competiciones(
                row.id_evento, row.precio, row.id,
                row.equipoA_nombre, row.equipoB_nombre, row.deporte, row.fecha, row.genero
            );

        } catch (e) {
            if (e instanceof CompeticionNoEncontrada) throw e;
            throw new ErrorDatos(`Error al buscar competición con ID ${id}`, { cause: e });
        }
    }

    static getCompeticionesByIdEvento(id_evento) {
        try {
            const rows = this.#getByEventoStmt.all(id_evento);
            return rows.map(row => new Competiciones(
                row.id_evento, row.precio, row.id,
                row.equipoA_nombre, row.equipoB_nombre, row.deporte, row.fecha, row.genero
            ));
        } catch (e) {
            throw new ErrorDatos(`Error al buscar competiciones del evento ${id_evento}`, { cause: e });
        }
    }

    static #insert(competicion) {
        try {
            const { id_evento, precio } = competicion;
            const datos = { id_evento, precio };

            const result = this.#insertStmt.run(datos);
            competicion.id = result.lastInsertRowid;

            return competicion;
        } catch (e) {
            throw new ErrorDatos('No se ha podido insertar la competición', { cause: e });
        }
    }

    static #update(competicion) {
        try {
            const { id_evento, precio, id } = competicion;
            const datos = { id_evento, precio, id };

            const result = this.#updateStmt.run(datos);
            if (result.changes === 0) throw new CompeticionNoEncontrada(id);

            return competicion;
        } catch (e) {
            if (e instanceof CompeticionNoEncontrada) throw e;
            throw new ErrorDatos(`Error al actualizar competición con ID ${competicion.id}`, { cause: e });
        }
    }

    static remove(id) {
        try {
            const result = this.#deleteStmt.run({ id });
            if (result.changes === 0) throw new CompeticionNoEncontrada(id);
            return true;
        } catch (e) {
            if (e instanceof CompeticionNoEncontrada) throw e;
            throw new ErrorDatos(`Error al eliminar competición: ${e.message}`);
        }
    }

    static persist(competicion) {
        if (competicion.id === undefined || competicion.id === null) {
            return Competiciones.#insert(competicion);
        } else {
            return Competiciones.#update(competicion);
        }
    }

    constructor(id_evento, precio, id = null, equipoA = null, equipoB = null, deporte = null, fecha = null, genero = null) {
        this.id = id;
        this.id_evento = id_evento;
        this.precio = precio;
        this.equipoA = equipoA;
        this.equipoB = equipoB;
        this.deporte = deporte;
        this.fecha = fecha;
        this.genero = genero;
    }
}

export class CompeticionNoEncontrada extends Error {
    constructor(id, options) {
        super(`Competición no encontrada: ${id}`, options);
        this.name = 'CompeticionNoEncontrada';
    }
}

export class ErrorDatos extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'ErrorDatos';
    }
}

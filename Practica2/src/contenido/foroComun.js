export class Foros {
    static #getBynombreStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;

    static initStatements(db) {
        if (this.#getBynombreStmt !== null) return;

        this.#getBynombreStmt = db.prepare('SELECT * FROM Foros WHERE nombre = @nombre');
        this.#insertStmt = db.prepare('INSERT INTO Foros(nombre, descripcion) VALUES (@nombre, @descripcion)');
        this.#updateStmt = db.prepare('UPDATE Foros SET nombre = @nombre, descripcion = @descripcion WHERE id = @id');
    }

    static getForoByNombre(nombre) {
        const foro = this.#getBynombreStmt.get({ nombre });
        if (foro === undefined) throw new ForoNoEncontrado(nombre);

        const {nombre, descripcion} = foro;

        return new Foros(nombre, descripcion);
    }

    static #insert(foro) {
        let result = null;
        try {
            const nombre = foro.nombre;
            const descripcion = foro.descripcion;
            const datos = {nombre, descripcion};

            result = this.#insertStmt.run(datos);

            foro.#id = result.lastInsertRowid;
        } catch(e) { 
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new ForoYaExiste(foro.nombre);
            }
            throw new ErrorDatos('No se ha insertado el Foro', { cause: e });
        }
        return foro;
    }

    static #update(foro) {
        const nombre = foro.nombre;
        const descripcion = foro.descripcion;
        const datos = {nombre, descripcion};

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new ForoNoEncontrado(username);

        return foro;
    }

    #id;
    nombre;
    descripcion;

    constructor(nombre, descripcion, id = null) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.#id = id;
    }

    get id() {
        return this.#id;
    }

    persist() {
        if (this.#id === null) return Foros.#insert(this);
        return Foros.#update(this);
    }
}

export class ForoNoEncontrado extends Error {
    /**
     * 
     * @param {string} nombre 
     * @param {ErrorOptions} [options]
     */
    constructor(nombre, options) {
        super(`Foro no encontrado: ${nombre}`, options);
        this.name = 'ForoNoEncontrado';
    }
}

export class ForoYaExiste extends Error {
    /**
     * 
     * @param {string} nombre 
     * @param {ErrorOptions} [options]
     */
    constructor(nombre, options) {
        super(`Foro ya existe: ${nombre}`, options);
        this.name = 'ForoYaExiste';
    }
}
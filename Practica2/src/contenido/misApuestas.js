export class MisApuestas {
    static #getByUserIdStmt = null;

    static initStatements(db) {
        if (this.#getByUserIdStmt !== null) return;

        this.#getByUserIdStmt = db.prepare(`
            SELECT * FROM Apuestas WHERE id_usuario = ?
        `);
    }

    static getByUserId(id_usuario) {
        try {
            return this.#getByUserIdStmt.all(id_usuario);
        } catch (e) {
            throw new Error('No se han podido obtener las apuestas del usuario', { cause: e });
        }
    }
}
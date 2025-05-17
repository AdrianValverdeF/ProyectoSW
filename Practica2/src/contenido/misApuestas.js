export class MisApuestas {
    static #getByUserIdStmt = null;

    static initStatements(db) {
        if (this.#getByUserIdStmt !== null) return;

        this.#getByUserIdStmt = db.prepare(`
            SELECT 
                Apuestas.id, 
                Apuestas.cantidad_apuesta, 
                Apuestas.multiplicador, 
                Apuestas.combinada, 
                Apuestas.ganador,
                Apuestas.resultado_exacto,
                Apuestas.diferencia_puntos,
                Apuestas.puntos_equipoA,
                Apuestas.puntos_equipoB,
                Apuestas.id_competicion,
                Apuestas.estado,              
                Apuestas.ganancia,           
                Eventos.fecha,
                Eventos.deporte,
                equipoA.nombre AS nombre_equipoA,
                equipoB.nombre AS nombre_equipoB
            FROM Apuestas
            JOIN Eventos ON Eventos.id = Apuestas.id_eventos
            JOIN Equipos AS equipoA ON equipoA.id = Eventos.equipoA
            JOIN Equipos AS equipoB ON equipoB.id = Eventos.equipoB
            WHERE Apuestas.id_usuario = ?
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
import bcrypt from "bcryptjs";
import { getConnection } from '../db.js';

export class Amigos {
    static #getSolsByIdStmt = null;
    static #getAmigosByIdStmt = null;
    static #solStmt = null;
    static #acceptStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getSolsByIdStmt !== null) return;

        this.#getSolsByIdStmt = db.prepare('SELECT * FROM Usuarios WHERE id_usuario = @id_usuario AND aceptado = 0');
        this.#getAmigosByIdStmt = db.prepare('SELECT * FROM Usuarios WHERE id_usuario = @id_usuario AND aceptado = 1');
        this.#solStmt = db.prepare('INSERT INTO Amigos(id_usuario, id_amigo, aceptado) VALUES (@id_usuario, @id_amigo, 0)');
        this.#acceptStmt = db.prepare('UPDATE Usuarios SET aceptado = 1 WHERE id_usuario = @id_usuario AND id_amigo = @id_amigo');
        this.#deleteStmt = db.prepare('DELETE * FROM Usuarios WHERE id_usuario = @id_usuario AND id_amigo = @id_amigo AND aceptado = 1')
    }

    static getAmigosById(id) {
        let result = null;
        try {
            result = this.#getAmigosByIdStmt.all();

        } catch (e) {
            throw new ErrorAmigos('No has añadido a ningún usuario', { cause: e });
        }

        return result.map(row => (row.id_usuario == id) ? Usuario.getUsuarioById(row.id_amigo) : Usuario.getUsuarioById(row.id_usuario));
    }

    static getSolicitudesById(id) {
        let result = null;
        try {
            result = this.#getSolsByIdStmt.all();

        } catch (e) {
            throw new ErrorAmigos('No tienes solicitudes pendientes', { cause: e });
        }

        return result.map(row => (row.id_usuario == id) ? Usuario.getUsuarioById(row.id_amigo) : Usuario.getUsuarioById(row.id_usuario));
    }

    static nuevaSolicitud(id_usuario, id_amigo) {

    }

    static aceptarSolicitud(id_usuario, id_amigo) {

    }

    static eliminar(id_usuario, id_amigo) {

    }

    id_usuario;
    id_amigo;
    aceptado;

    constructor(id_usuario, id_amigo, aceptado) {
        this.id_usuario = id_usuario;
        this.id_amigo = id_amigo;
        this.aceptado = aceptado;
    }

    /*static getUsuarioById(id) {
        let result = null;
        try {
            result = this.#getByIdStmt.get({ id });
        } catch (e) {
            throw new ErrorDatos('No se ha encontrado el usuario', { cause: e });
        }
        return result;
    }

    static getIdByUsername(username) {
        const usuario = this.getUsuarioByUsername(username);
        return usuario.id_user;
    }

    static #insert(usuario) {
        let result = null;
        try {
            const username = usuario.username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const apellido = usuario.apellido;
            const edad = usuario.edad;
            const rol = usuario.rol;
            const datos = { username, password, nombre, apellido, edad, rol };

            result = this.#insertStmt.run(datos);

            usuario.#id = result.lastInsertRowid;
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new UsuarioYaExiste(usuario.username);
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static #update(usuario) {
        const id = usuario.#id; 
        const username = usuario.username; 
        const password = usuario.#password; 
        const nombre = usuario.nombre; 
        const apellido = usuario.apellido; 
        const edad = usuario.edad; 
        const rol = usuario.rol;

        const datos = { id, username, password, nombre, apellido, edad, rol };

        const result = this.#updateStmt.run(datos);

        if (result.changes === 0) throw new UsuarioNoEncontrado(username);

        return usuario;
    }

    static login(username, password) {
        let usuario = null;
        try {
            usuario = this.getUsuarioByUsername(username);
        } catch (e) {
            throw new UsuarioOPasswordNoValido(username, { cause: e });
        }
        
        if (!bcrypt.compareSync(password, usuario.#password)) throw new UsuarioOPasswordNoValido(username);

        return usuario;
    }

    static register(username, password, nombre, apellido, edad, rol = RolesEnum.USUARIO) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const usuario = new Usuario(username, hashedPassword, nombre, apellido, edad, rol);

        try {
            return this.#insert(usuario);
        } catch (e) {
            if (e instanceof UsuarioYaExiste) {
                throw e;
            }
            throw new Error('Error al registrarse', { cause: e });
        }
    }

    #id;
    username;
    #password;
    rol;
    nombre;
    apellido;
    edad;

    constructor(username, password, nombre, apellido, edad, rol = RolesEnum.USUARIO, id = null) {
        this.username = username;
        this.#password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.rol = rol;
        this.#id = id;
    }

    get id_user() {
        return this.#id;
    }

    set password(nuevoPassword) {
        this.#password = bcrypt.hashSync(nuevoPassword);
    }

    get username() {
        return this.username;
    }

    persist() {
        if (this.#id === null) return Usuario.#insert(this);
        return Usuario.#update(this);
    }
}

export class UsuarioNoEncontrado extends Error {
    constructor(username, options) {
        super(`Usuario no encontrado: ${username}`, options);
        this.name = 'UsuarioNoEncontrado';
    }
}

export class UsuarioOPasswordNoValido extends Error {
    constructor(username, options) {
        super(`Usuario o password no válido: ${username}`, options);
        this.name = 'UsuarioOPasswordNoValido';
    }
}

export class UsuarioYaExiste extends Error {
    constructor(username, options) {
        super(`Usuario ya existe: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }*/
}

export class ErrorAmigos extends Error {
    /**
     * 
     * @param {string} message 
     * @param {ErrorOptions} [options]
     */
    constructor(message, options) {
        super(message, options);
        this.name = 'ErrorAmigos';
    }
}
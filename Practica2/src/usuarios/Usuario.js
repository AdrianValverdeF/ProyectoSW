import bcrypt from "bcryptjs";
import { getConnection } from '../db.js';



export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A'
});

export class Usuario {
    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #getByIdStmt = null;

    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;

        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#getByIdStmt = db.prepare('SELECT * FROM Usuarios WHERE id = @id');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, apellido, edad, rol) VALUES (@username, @password, @nombre, @apellido, @edad, @rol)');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre, apellido = @apellido, edad = @edad WHERE id = @id');
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { password, rol, nombre, apellido, edad, id } = usuario;
        return new Usuario(username, password, nombre, apellido, edad, rol, id);
    }

    static getUsuarioById(id) {
        let result = null;
        try {
            result = this.#getByIdStmt.get({ id });
        } catch (e) {
            throw new Error(`Error al obtener el usuario por ID: ${e.message}`);
        }
        if (result === undefined) throw new UsuarioNoEncontrado(id);
        const { username, password, rol, nombre, apellido, edad } = result;
        return new Usuario(username, password, nombre, apellido, edad, rol, id);
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
        const username = usuario.username;
        const password = usuario.#password;
        const nombre = usuario.nombre;
        const apellido = usuario.apellido;
        const edad = usuario.edad;
        const rol = usuario.rol;
        const datos = { username, password, nombre, apellido, edad, rol };

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new UsuarioNoEncontrado(username);

        return usuario;
    }

    static async login(username, password) {
        const db = getConnection();
        let usuario;
        try {
            usuario = this.getUsuarioByUsername(username);
        } catch (e) {
            throw new UsuarioOPasswordNoValido(username);
        }

        const isValidPassword = await bcrypt.compare(password, usuario.password);
        if (!isValidPassword) {
            throw new UsuarioOPasswordNoValido(username); 
        }
        return usuario;
    }

    static async register(username, password, nombre, apellido, edad) {
        const db = getConnection();
        const hashedPassword = await bcrypt.hash(password, 10);
        this.#insertStmt.run({ username, password: hashedPassword, nombre, apellido, edad, rol: RolesEnum.USUARIO });
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
    constructor(identifier) {
        super(`Usuario no encontrado: ${identifier}`);
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
    }
}
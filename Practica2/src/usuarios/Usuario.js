import bcrypt from "bcryptjs";

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
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre WHERE id = @id');
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
    }
}
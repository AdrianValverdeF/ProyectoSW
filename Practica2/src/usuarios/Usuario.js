import bcrypt from "bcryptjs";
import { getConnection } from '../db.js';

export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A'
});

export class Usuario {
    static #getAll = null;
    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #getByIdStmt = null;

    static #getAmigosByIdStmt = null;
    static #getSolicitudesByIdStmt = null;
    static #solStmt = null;
    static #acceptStmt = null;
    static #deleteStmt = null;

    static #insertImgStmt = null;
    static #getImgStmt = null;
    static #updateImgStmt = null;
    static #getListaUsuariosStmt = null;

    static #getFondosByIdStmt = null;
    static #updateFondosStmt = null;

    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;
        this.db = db;
        this.#getAll = db.prepare('SELECT * FROM Usuarios');
        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#getByIdStmt = db.prepare('SELECT * FROM Usuarios WHERE id = @id');
        this.#insertStmt = db.prepare(`
            INSERT INTO Usuarios(username, password, nombre, apellido, edad, rol, fondos) 
            VALUES (@username, @password, @nombre, @apellido, @edad, @rol, @fondos)
        `);
        this.#updateStmt = db.prepare(`
            UPDATE Usuarios 
            SET username = @username, password = @password, rol = @rol, nombre = @nombre, apellido = @apellido, edad = @edad, fondos = @fondos
            WHERE id = @id
        `);
        this.#getAmigosByIdStmt = db.prepare('SELECT u.username, a.id_amigo, a.id_usuario, i.rutaImg FROM Usuarios u INNER JOIN Amigos a ON ((u.id = a.id_amigo AND a.id_usuario = @id) OR (u.id = a.id_usuario AND a.id_amigo = @id)) INNER JOIN Imagenes i ON u.id = i.id_usuario WHERE a.aceptado = 1;');

        this.#getSolicitudesByIdStmt = db.prepare('SELECT u.username, a.id_amigo, a.id_usuario,i.rutaImg FROM Usuarios u INNER JOIN Amigos a ON u.id = a.id_usuario INNER JOIN Imagenes i ON u.id = i.id_usuario WHERE a.id_amigo = @id AND a.aceptado = 0;');
        
        this.#solStmt = db.prepare('INSERT INTO Amigos(id_usuario, id_amigo, aceptado) SELECT @id_usuario, @id_amigo, @aceptado WHERE NOT EXISTS (SELECT 1 FROM Amigos WHERE (id_usuario = @id_usuario AND id_amigo = @id_amigo) OR (id_usuario = @id_amigo AND id_amigo = @id_usuario))');
        this.#acceptStmt = db.prepare('UPDATE Amigos SET aceptado = 1 WHERE (id_usuario = @id_usuario AND id_amigo = @id_amigo) OR (id_usuario = @id_amigo AND id_amigo = @id_usuario)');
        this.#deleteStmt = db.prepare('DELETE FROM Amigos WHERE (id_usuario = @id_usuario AND id_amigo = @id_amigo) OR (id_usuario = @id_amigo AND id_amigo = @id_usuario)');
        this.#getFondosByIdStmt = db.prepare('SELECT fondos FROM Usuarios WHERE id = ?');
        
        this.#getListaUsuariosStmt = db.prepare(`
            SELECT *
            FROM Usuarios
            WHERE 
                (:username IS NULL OR username = :username) AND
                (:nombre IS NULL OR nombre = :nombre) AND
                (:apellido IS NULL OR apellido = :apellido) AND
                (:rol IS NULL OR rol = :rol) AND
                (:edad IS NULL OR edad = :edad) AND
                id != @id;
        `);

        this.#updateFondosStmt = db.prepare(`
            UPDATE Usuarios
            SET fondos = @fondos
            WHERE id = @id
        `);

        this.#insertImgStmt = db.prepare(`INSERT INTO Imagenes (id_usuario, rutaImg) VALUES (@id_usuario, @rutaImg)`);
        this.#getImgStmt = db.prepare(`SELECT * FROM Imagenes WHERE id_usuario = @id_usuario`);
        this.#updateImgStmt = db.prepare(`UPDATE Imagenes SET rutaImg = @rutaImg WHERE id_usuario = @id_usuario`);
    }

    static insertImagen(id_usuario, rutaImg) {
        const datos = { id_usuario, rutaImg };
        try {
            this.#insertImgStmt.run(datos);
        } catch (e) {
            throw new Error('No se ha podido insertar la imagen', { cause: e });
        }

    }

    static getImagen(id_usuario) {
        let result = null;
        try {
            result = this.#getImgStmt.get({ id_usuario });
            if (!result) {
                throw new UsuarioNoEncontrado(`ID: ${id_usuario}`);
            }
        }
        catch (e) {
            throw new Error('No se ha encontrado la imagen', { cause: e });
        }
        return result;
    }

    static updateImagen(id_usuario, rutaImg) {
        const datos = { id_usuario, rutaImg };
        try {
            this.#updateImgStmt.run(datos);
        } catch (e) {
            throw new Error('No se ha podido actualizar la imagen', { cause: e });
        }
    }

    static getListaUsuarios(username, nombre,apellido, edad, rol, id) {
        let result = null;
        try {
            if (username === '') username = null;
            if (nombre === '') nombre = null;
            if (apellido === '') apellido = null;
            if (edad === '') edad = null;
            if (rol === '') rol = null;
           
            result = this.#getListaUsuariosStmt.all({ username, nombre,apellido, edad, rol, id});
            if (!result) {
                throw new UsuarioNoEncontrado('No hay usuarios registrados');
            }
            result = result
            .map(usuario => {
                const { password, ...rest } = usuario;
                return rest;
            });
        } catch (e) {
            throw new ErrorDatos('No se han encontrado usuarios', { cause: e });
        }
        return result;
    }



    static getUsuarioByUsername(username) {
         
        const usuario = this.#getByUsernameStmt.get({ username });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { password, rol, nombre, apellido, edad, id, fondos } = usuario;
        return new Usuario(username, password, nombre, apellido, edad, rol, id, fondos);
    }

    static getUsuarioById(id) {
        let result = null;
        try {
            result = this.#getByIdStmt.get({ id });
            if (!result) {
                throw new UsuarioNoEncontrado(`ID: ${id}`);
            }
          result.password = undefined; 
        } catch (e) {
            throw new ErrorDatos('No se ha encontrado el usuario', { cause: e });
        }
        return result;
    }

    static getAll(id) {
        let result = null;
        try{
            result = this.#getAll.all();
            if (!result) {
                throw new UsuarioNoEncontrado('No hay usuarios registrados');
            }
            result = result
                .filter(usuario => usuario.id !== id)
                .map(usuario => {
                    const { password, ...rest } = usuario;
                    return rest;
                });

        }  catch (e) {  
            throw new ErrorDatos('No se han encontrado usuarios', { cause: e });
        }
        return result; 
    }


    static getIdByUsername(username) {
        const usuario = this.getUsuarioByUsername(username);
        return usuario.id_user;
    }

    static #insertUsuario(usuario) {
        let result = null;
        try {
            const username = usuario.username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const apellido = usuario.apellido;
            const edad = usuario.edad;
            const rol = usuario.rol;
            const fondos = usuario.fondos;
            const datos = { username, password, nombre, apellido, edad, rol, fondos};

            result = this.#insertStmt.run(datos);

            usuario.id = result.lastInsertRowid;
        } catch (e) {
            if (e.code === 'SQLITE_CONSTRAINT') {
                throw new UsuarioYaExiste(usuario.username);
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static #update(usuario) {
        const id = usuario.id; 
        const username = usuario.username; 
        const password = usuario.#password; 
        const nombre = usuario.nombre; 
        const apellido = usuario.apellido; 
        const edad = usuario.edad; 
        const rol = usuario.rol;
        const fondos = usuario.fondos;

        const datos = { id, username, password, nombre, apellido, edad, rol, fondos };

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

    static register(username, password, nombre, apellido, edad, rol = RolesEnum.USUARIO, fondos = 0) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const usuario = new Usuario(username, hashedPassword, nombre, apellido, edad, rol, fondos);

        try {
            this.#insertUsuario(usuario);
            usuario.id = this.getIdByUsername(usuario.username);
            return usuario;
        } catch (e) {
            if (e instanceof UsuarioYaExiste) {
                throw e;
            }
            throw new Error('Error al registrarse', { cause: e });
        }
    }

    static getAmigosById(id_usuario) {
        const id = parseInt(id_usuario, 10);
        const amigos = this.#getAmigosByIdStmt.all({ id });
        return amigos;
    }

    static getSolicitudesById(id_usuario) {
        const id = parseInt(id_usuario, 10);
        const solicitudes = this.#getSolicitudesByIdStmt.all({ id });
        return solicitudes;
    }

    static #insertAmigo(id_usuario, id_amigo, aceptado) {
            let result = null;
            let datos = {};
            try {
                datos = { id_usuario, id_amigo, aceptado };
    
                result = this.#solStmt.run(datos);
    
            } catch (e) {
                if (e.code === 'SQLITE_CONSTRAINT') {
                    throw new SolYaExiste(id_amigo);
                }
                throw new ErrorAmigos('No se ha podido procesar la solicitud', { cause: e });
            }
            return datos;
        }

    static nuevaSolicitud(id_usuario, id_amigo) {
        try {
            return this.#insertAmigo(id_usuario, id_amigo, 0);
        } catch (e) {
            if (e instanceof SolYaExiste) {
                throw e;
            }
            throw new Error('Error al procesar solicitud', { cause: e });
        }
    }

    static aceptarSolicitud(id_usuario, id_amigo) {
        const datos = { id_usuario, id_amigo };

        try {
            return this.#acceptStmt.run(datos)
        } catch (e) {
            throw new Error('Error al aceptar solicitud', { cause: e });
        }
    }

    static eliminar(id_usuario, id_amigo) {
        const datos = { id_usuario, id_amigo };

        try {
            return this.#deleteStmt.run(datos)
        } catch (e) {
            throw new Error('Error al eliminar solicitud', { cause: e });
        }
    }

    static updateFondos(id_usuario, nuevosFondos) {
        try {
            const result = this.#updateFondosStmt.run({ id: id_usuario, fondos: nuevosFondos });
            if (result.changes === 0) throw new UsuarioNoEncontrado(`ID: ${id_usuario}`);
        } catch (e) {
            throw new Error('Error al actualizar los fondos', { cause: e });
        }
    }

    static agregarFondos(id_usuario, cantidad) {
        try {
            const fondosActuales = this.getFondosById(id_usuario);
            const nuevosFondos = Number(fondosActuales) + Number(cantidad);;
            return this.updateFondos(id_usuario, nuevosFondos);
        } catch (e) {
            throw new Error('Error al agregar fondos', { cause: e });
        }
    }

    static getFondosById(id_usuario) {

        try {
            const fondos = this.#getFondosByIdStmt.get([id_usuario]);
            return fondos.fondos;
        }
        catch (e) {
            throw new Error('Error al obtener los fondos del usuario', { cause: e });
        }
    }

    static restarFondos(id_usuario, cantidad) {
        try {
            const fondosActuales = this.getFondosById(id_usuario);
            if (fondosActuales < cantidad) throw new Error('Fondos insuficientes');
            const nuevosFondos = fondosActuales - cantidad;
            return this.updateFondos(id_usuario, nuevosFondos);
        } catch (e) {
            throw new Error('Error al restar fondos', { cause: e });
        }
    }

    static getUsuariosByIds(ids) {
        if (!ids || ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const stmt = this.db.prepare(`SELECT id, username FROM Usuarios WHERE id IN (${placeholders})`);
        return stmt.all(...ids);
    }

    #id;
    username;
    #password;
    rol;
    nombre;
    apellido;
    edad;
    fondos;

    constructor(username, password, nombre, apellido, edad, rol = RolesEnum.USUARIO, id = null, fondos = 0) {
        this.username = username;
        this.#password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.rol = rol;
        this.id = id;
        this.fondos = fondos;
    }

    get id_user() {
        return this.id;
    }

    set password(nuevoPassword) {
        this.#password = bcrypt.hashSync(nuevoPassword);
    }

    get username() {
        return this.username;
    }

    persist() {
        if (this.id === null) return Usuario.#insertUsuario(this);
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

export class SolYaExiste extends Error {
    constructor(username, options) {
        super(`Ya has solicitado a ${username}`, options);
        this.name = 'SolYaExiste';
    }
}
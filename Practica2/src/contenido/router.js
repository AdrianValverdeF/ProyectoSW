import express from 'express';

const contenidoRouter = express.Router();

contenidoRouter.get('/normal', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/normal';
    }
    
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/admin', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.esAdmin) {
        contenido = 'paginas/admin';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/gestion-apuestas', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/gestion-apuestas';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/gestion-eventos', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/gestion-eventos';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/perfil', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/perfil';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/foroFutbol11', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/foroFutbol11';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/foroFutbolSala', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/foroFutbolSala';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});
contenidoRouter.get('/foroVoleibol', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/foroVoleibol';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/foroRugby', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/foroRugby';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});

contenidoRouter.get('/foroBaloncesto', (req, res) => {
    let contenido = 'paginas/noPermisos';
    if (req.session.login) {
        contenido = 'paginas/foroBaloncesto';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
});


export default contenidoRouter;
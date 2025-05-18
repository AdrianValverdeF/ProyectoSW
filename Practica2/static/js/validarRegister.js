document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.session-form.register');
    if (!form) return;

    const campos = {
        name: {
            validar: v => v.trim().length >= 1,
            mensaje: 'El nombre debe tener al menos 1 caracteres.'
        },
        surname: {
            validar: v => v.trim().length >= 1,
            mensaje: 'El apellido debe tener al menos 1 caracteres.'
        },
        username: {
            validar: v => v.trim().length >= 1,
            mensaje: 'El usuario debe tener al menos 1 caracteres.'
        },
        password: {
            validar: v => v.length >= 8,
            mensaje: 'La contraseña debe tener al menos 8 caracteres.'
        },
        age: {
            validar: v => Number(v) >= 18,
            mensaje: 'Debes ser mayor de 18 años.'
        },
        profileImage: {
            validar: v => true, 
            mensaje: ''
        }
    };

    // Añade spans para mensajes de error si no existen
    Object.keys(campos).forEach(nombre => {
        const input = form.querySelector(`[name="${nombre}"]`);
        if (input && !input.nextElementSibling?.classList?.contains('error-messageR')) {
            const span = document.createElement('span');
            span.className = 'error-messageR';
            input.after(span);
        }
    });

    // Validación en tiempo real
    Object.keys(campos).forEach(nombre => {
        const input = form.querySelector(`[name="${nombre}"]`);
        if (!input) return;
        input.addEventListener('input', () => {
            validarCampo(input, campos[nombre]);
        });
    });

    // Validación al enviar
    form.addEventListener('submit', e => {
        let valido = true;
        Object.keys(campos).forEach(nombre => {
            const input = form.querySelector(`[name="${nombre}"]`);
            if (!input) return;
            if (!validarCampo(input, campos[nombre])) {
                valido = false;
            }
        });
        if (!valido) {
            e.preventDefault();
        }
    });

    function validarCampo(input, reglas) {
        const valor = input.type === 'file' ? input.files[0] : input.value;
        const esValido = reglas.validar(valor || '');
        const errorSpan = input.nextElementSibling;
        if (!esValido) {
            input.classList.add('invalid');
            if (errorSpan) errorSpan.textContent = reglas.mensaje;
        } else {
            input.classList.remove('invalid');
            if (errorSpan) errorSpan.textContent = '';
        }
        return esValido;
    }
});
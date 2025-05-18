document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-modificar');
    if (!form) return;

    // Reglas de validación para cada campo
    const campos = {
        nombre: {
            validar: v => v.trim().length > 0,
            mensaje: 'El nombre no puede estar vacío.'
        },
        apellido: {
            validar: v => v.trim().length > 0,
            mensaje: 'El apellido no puede estar vacío.'
        },
        edad: {
            validar: v => Number(v) >= 18,
            mensaje: 'Debes ser mayor de 18 años.'
        },
        username: {
            validar: v => v.trim().length > 0,
            mensaje: 'El usuario no puede estar vacío.'
        },
        rol: {
            validar: v => v.trim().length > 0 && (v === 'A' || v === 'U'), 
            mensaje: 'El rol no puede estar vacío y los valores válidos son "A" o "U".'
        },
        fondos: {
            validar: v => !isNaN(v) && Number(v) >= 0,
            mensaje: 'Fondos debe ser un número positivo.'
        }
    };

    // Añade spans para mensajes de error si no existen
    Object.keys(campos).forEach(nombre => {
        const input = form.querySelector(`[name="${nombre}"]`);
        if (!input) return;
        let errorSpan = input.parentElement.querySelector('.error-messageR');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-messageR';
            input.parentElement.appendChild(errorSpan);
        }
        // Validación en tiempo real
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
        const valor = input.value;
        const esValido = reglas.validar(valor || '');
        const errorSpan = input.parentElement.querySelector('.error-messageR');
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
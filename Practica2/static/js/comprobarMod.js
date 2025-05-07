/*
 * Inicializamos el JS cuando se ha terminado de procesar todo el HTML de la página.
 *
 * Al incluir <script> al final de la página podríamos invocar simplemente a init().
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * Inicializa la página
 */
function init() {
    const formMod = document.forms.namedItem('formMod');
    formMod.addEventListener('submit', modSubmit);

    const edad = formMod.elements.namedItem('eadad');
    edad.addEventListener('input', compruebaEdad);

}

/**
 * 
 * @param {SubmitEvent} e 
 */
async function modSubmit(e){
    // No se envía el formulario manualmente
    e.preventDefault();
    const formMod = e.target;
    try {
        const formData = new FormData(formMod);
        const response = await postData('/contenido/modificarUsuario', formData);
        window.location.assign('/contenidos/perfil');
    } catch (err) {
        if (err instanceof ResponseError) {
            switch(err.response.status) {
                case 400:
                    await displayErrores(err.response);
                    break;
            }
        }
        console.error(`Error: `, err);
    } 
}

async function displayErrores(response) {
    const { errores } = await response.json();
    const formMod = document.forms.namedItem('registro');
    for(const input of formMod.elements) {
        if (input.name == undefined || input.name === '') continue;
        const feedback = formMod.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (feedback == undefined) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}

function compruebaEdad(e) {
    const edad = e.target;
    if (EdadValida(edad.value)) {
        edad.setCustomValidity('');
    } else {
        edad.setCustomValidity("La edad no es válida solo se permite >= 18");
    }
    

    const esCorreoValido = edad.checkValidity();
    const feedback = edad.form.querySelector(`*[name="${edad.name}"] ~ .feedback`);
    if(edad.value === '') {
        feedback.textContent = '';

    }else if (esCorreoValido) {
        feedback.textContent = '✔';
        // ✔
    } else {			
        feedback.textContent = '⚠';
        // ⚠
    }
    // Muestra el mensaje de validación
    edad.reportValidity();
}

function EdadValida(edad) {
    return edad >= 18;
}
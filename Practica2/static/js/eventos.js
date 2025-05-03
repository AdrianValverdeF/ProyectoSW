async function eliminarEvento(eventId, clickEvent) {
    clickEvent.stopPropagation();

    const modal = document.getElementById('modalConfirmacionEliminar');
    const confirmBtn = document.getElementById('botonConfirmarEliminar');
    const cancelBtn = document.getElementById('botonCancelarEliminar');

    modal.style.display = 'flex';

    const userConfirmed = await new Promise((resolve) => {

        confirmBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };
    });

    if (!userConfirmed) return;

    try {
        const response = await fetch(`/contenido/eventos/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar el evento');
        }

        document.querySelector(`[data-evento-id="${eventId}"]`).remove();

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

function editarEvento(eventId, clickEvent) {
    clickEvent.stopPropagation();
    window.location.href = `/contenido/eventos/${eventId}/editar`;
}

function crearEvento(clickEvent) {
    clickEvent.stopPropagation();
    window.location.href = `/contenido/eventos/crear`;
}

document.addEventListener('DOMContentLoaded', function () {
    const deporteSelect = document.getElementById('deporte');
    const generoSelect = document.getElementById('genero');
    const equipoASelect = document.getElementById('equipoA');
    const equipoBSelect = document.getElementById('equipoB');

    function filtrarEquipos() {
        const deporteSeleccionado = deporteSelect.value;
        const generoSeleccionado = generoSelect.value;

        [equipoASelect, equipoBSelect].forEach(select => {
            const valorActual = select.value;
            let seleccionValida = false;

            Array.from(select.options).forEach(option => {
                if (option.value === "") {
                    option.style.display = "";
                    option.disabled = false;
                    return;
                }

                const coincideDeporte = !deporteSeleccionado || option.dataset.deporte === deporteSeleccionado;
                const coincideGenero = !generoSeleccionado || option.dataset.genero === generoSeleccionado;
                const mostrarOpcion = coincideDeporte && coincideGenero;

                option.style.display = mostrarOpcion ? "" : "none";
                option.disabled = !mostrarOpcion;

                if (mostrarOpcion && option.value === valorActual) {
                    seleccionValida = true;
                }
            });

            if (!seleccionValida && select.value) {
                select.value = "";
            }
        });
    }

    deporteSelect.addEventListener('change', filtrarEquipos);
    generoSelect.addEventListener('change', filtrarEquipos);

    equipoASelect.addEventListener('change', function () {
        if (this.value === equipoBSelect.value) {
            equipoBSelect.value = "";
        }
    });

    equipoBSelect.addEventListener('change', function () {
        if (this.value === equipoASelect.value) {
            equipoASelect.value = "";
        }
    });

    filtrarEquipos();
});
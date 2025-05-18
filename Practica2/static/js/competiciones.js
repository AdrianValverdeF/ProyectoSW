
function crearCompeticion(clickEvent) {
    clickEvent.stopPropagation();
    window.location.href = `/contenido/competiciones/crear`;
}

function editarCompeticion(eventId, clickEvent) {
    clickEvent.stopPropagation();
    window.location.href = `/contenido/competiciones/${eventId}/editar`;
}

document.addEventListener('DOMContentLoaded', function () {
    const deporteSelect = document.getElementById('deporte-competicion');
    const generoSelect = document.getElementById('genero-competicion');
    const eventoSelect = document.getElementById('evento-competicion');

    function filtrarEventos() {
        const deporte = deporteSelect.value;
        const genero = generoSelect.value;

        const valorActual = eventoSelect.value;
        let seleccionValida = false;

        Array.from(eventoSelect.options).forEach(opt => {
            if (!opt.value) {
                opt.style.display = "";
                opt.disabled = false;
                return;
            }

            const coincideDeporte = opt.dataset.deporte === deporte.toLowerCase();
            const coincideGenero = opt.dataset.genero === genero;
            const mostrar = coincideDeporte && coincideGenero;

            opt.style.display = mostrar ? "" : "none";
            opt.disabled = !mostrar;

            if (mostrar && opt.value === valorActual) {
                seleccionValida = true;
            }
        });

        if (!seleccionValida) {
            eventoSelect.value = "";
        }
    }

    deporteSelect.addEventListener('change', filtrarEventos);
    generoSelect.addEventListener('change', filtrarEventos);

    filtrarEventos();
});

async function eliminarCompeticion(competicionId, clickEvent) {
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
        const response = await fetch(`/contenido/competiciones/${competicionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar la competición');
        }

        document.querySelector(`[data-competicion-id="${competicionId}"]`).remove();

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEditarCompeticion');
  if (form) {
    form.addEventListener('submit', confirmarEdicionCompeticion);
  }
});

async function confirmarEdicionCompeticion(event) {
    event.preventDefault();

    const modal = document.getElementById('modalConfirmacionEditar');
    const confirmBtn = document.getElementById('botonConfirmarEditar');
    const cancelBtn = document.getElementById('botonCancelarEditar');

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

    event.target.submit();
}
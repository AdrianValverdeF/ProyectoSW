document.addEventListener('DOMContentLoaded', () => {
    const secciones = [
        { cb: 'apuestaGanador' },
        { cb: 'apuestaPuntosA' },
        { cb: 'apuestaPuntosB' },
        { cb: 'apuestaExacto' },
        { cb: 'apuestaDiferencia' }
    ];

    secciones.forEach(({ cb }) => {
        const checkbox = document.getElementById(cb);
        const section = document.getElementById('seccion' + cb.replace('apuesta', ''));
        const inputs = section.querySelectorAll('input');
        checkbox.addEventListener('change', () => inputs.forEach(i => i.disabled = !checkbox.checked));
    });

    // Parámetros
    const puntosReferencia = 50;
    const puntosPorEquipo = { futbol11: 2, futbolSala: 2, rugby: 9, voleibol: 40, baloncesto: 70 };
    const pesoGanador = 0.5;
    const pesoExacto = 1;

    // DOM
    const deporte = '<%= evento.deporte.toLowerCase() %>';
    const sliderA = document.getElementById('sliderA');
    const sliderB = document.getElementById('sliderB');
    const inputDiferencia = document.getElementById('inputDiferencia');
    const hiddenMult = document.getElementById('hiddenMultiplicador');
    const multField = document.getElementById('multiplicador');

    function factorSport() {
        const pts = puntosPorEquipo[deporte] || 10;
        return puntosReferencia / pts;
    }

    function calcular() {
        let mult = 1;
        const factor = factorSport();

        // Ganador
        if (document.getElementById('apuestaGanador').checked) mult += pesoGanador * factor;
        // Exacto
        if (document.getElementById('apuestaExacto').checked) mult += pesoExacto * factor;
        // Puntos A
        if (document.getElementById('apuestaPuntosA').checked) mult += (sliderA.value / puntosReferencia) * factor;
        // Puntos B
        if (document.getElementById('apuestaPuntosB').checked) mult += (sliderB.value / puntosReferencia) * factor;
        // Diferencia
        if (document.getElementById('apuestaDiferencia').checked) mult += (inputDiferencia.value / puntosReferencia) * factor;

        return Number(mult.toFixed(2));
    }

    function actualizarMultiplicador() {
        const m = calcular();
        multField.value = m;
        hiddenMult.value = m;
    }

    document.querySelectorAll('#apuestaGanador, #apuestaExacto, #apuestaPuntosA, #apuestaPuntosB, #apuestaDiferencia, #sliderA, #sliderB, #inputDiferencia')
        .forEach(el => el.addEventListener('input', actualizarMultiplicador));

    actualizarMultiplicador();
});

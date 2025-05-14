document.addEventListener('DOMContentLoaded', () => {
    // Lógica de los deslizadores de puntos

    const etiquetas = { mas: 'Más de', menos: 'Menos de' };

    document.querySelectorAll('.control-deslizador').forEach(control => {

      const deslizador = control.querySelector('.deslizador-puntos');
      let modo = 'mas';
      const botones = control.querySelectorAll('.boton-toggle');
      const marcador = control.querySelector('.marca-deslizador');

      botones.forEach(btn => {
        btn.addEventListener('click', () => {
          botones.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          modo = btn.dataset.tipo;
          actualizarMarcador();
        });
      });

      deslizador.addEventListener('input', actualizarMarcador);

      function actualizarMarcador() {
        marcador.textContent = `${etiquetas[modo]} ${deslizador.value}`;
        const porcentaje = (deslizador.value - deslizador.min) / (deslizador.max - deslizador.min) * 100;
        marcador.style.left = `calc(${porcentaje}% - 20px)`;
      }

      botones[0].classList.add('active');
      actualizarMarcador();
    });

  });

  // Lógica para el filtro de eventos por deporte
  document.querySelectorAll('.sport-item').forEach(item => {
    item.addEventListener('click', e => {

        const deporteSeleccionado = item.dataset.deporte;
        
        document.querySelectorAll('.sport-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        const eventos = document.querySelectorAll('.contenedor-evento');
        eventos.forEach(evento => {
            const deporteEvento = evento.dataset.deporte;
            if (deporteSeleccionado === 'todos' || deporteEvento === deporteSeleccionado) {
                evento.style.display = 'block';
            } else {
                evento.style.display = 'none';
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const cabecera = document.querySelector('.cabecera-movil');
    const navContainer = document.querySelector('.nav-container');
    const body = document.body;

    cabecera.addEventListener('click', function() {
        cabecera.classList.toggle('active');
        navContainer.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    const navItems = document.querySelectorAll('.nav-container a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            cabecera.classList.remove('active');
            navContainer.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });
});
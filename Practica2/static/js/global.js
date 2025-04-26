// if(document.querySelector('.welcome-popup')) {

//     if(!sessionStorage.getItem('welcomePopupShown')) {

//         // Show the popup if it hasn't been shown before
//         const popup = document.querySelector('.welcome-popup');
//         popup.style.opacity = '1';
//         popup.style.display = 'block';
        
//         setTimeout(() => {
//             popup.style.opacity = '0';
//             setTimeout(() => {
//                 popup.style.display = 'none';
//             }, 500);
//         }, 3000);
        
//         sessionStorage.setItem('welcomePopupShown', 'true');
//     }

// }

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
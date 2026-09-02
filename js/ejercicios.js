/**
 * GymRat - Catalogo de ejercicios y constructor de rutina (ejercicios.html).
 * Cada ejercicio que se agrega al carrito lleva su propia prescripcion
 * (series / repeticiones / descanso en segundos), que luego se usa en la
 * pantalla de ejecucion de la rutina (ejecutar-rutina.html).
 */
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavSesion("");

  const listaEjerciciosEl = document.getElementById("listaEjercicios");
  const sinResultadosEl = document.getElementById("sinResultados");
  const contadorEl = document.getElementById("contadorResultados");
  const filtrosGrupoEl = document.getElementById("filtrosGrupo");
  const filtroDificultadEl = document.getElementById("filtroDificultad");
  const filtroTextoEl = document.getElementById("filtroTexto");

  let grupoActivo = "";

  // Preseleccion de grupo via query string (?grupo=PECHO), usada por los
  // accesos directos de "Explora por grupo muscular" en la home. Si el
  // valor no calza con ningun chip valido, se ignora y queda "Todos".
  const grupoQuery = (new URLSearchParams(window.location.search).get("grupo") || "").toUpperCase();
  if (grupoQuery) {
    const chipQuery = filtrosGrupoEl.querySelector('.gr-filter-chip[data-grupo="' + grupoQuery + '"]');
    if (chipQuery) {
      filtrosGrupoEl.querySelectorAll(".gr-filter-chip").forEach((c) => c.classList.remove("active"));
      chipQuery.classList.add("active");
      grupoActivo = grupoQuery;
    }
  }

  const btnLimpiarFiltrosEl = document.getElementById("btnLimpiarFiltros");
  const btnLimpiarFiltrosVacioEl = document.getElementById("btnLimpiarFiltrosVacio");

  function hayFiltrosActivos() {
    return !!(grupoActivo || filtroDificultadEl.value || filtroTextoEl.value.trim());
  }

  function limpiarFiltros() {
    grupoActivo = "";
    filtrosGrupoEl.querySelectorAll(".gr-filter-chip").forEach((c) => c.classList.remove("active"));
    filtrosGrupoEl.querySelector('.gr-filter-chip[data-grupo=""]').classList.add("active");
    filtroDificultadEl.value = "";
    filtroTextoEl.value = "";
    renderCatalogo();
  }

  function badgeDificultad(dificultad) {
    const clases = { PRINCIPIANTE: "gr-badge-outline", INTERMEDIO: "gr-badge-accent", AVANZADO: "gr-badge-red" };
    return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
  }

  // La dificultad de la rutina ya no se elige a mano: se calcula sola a
  // partir de la dificultad de cada ejercicio agregado (promedio
  // redondeado, PRINCIPIANTE=1 / INTERMEDIO=2 / AVANZADO=3).
  const PESO_DIFICULTAD = { PRINCIPIANTE: 1, INTERMEDIO: 2, AVANZADO: 3 };
  const DIFICULTAD_POR_PESO = { 1: "PRINCIPIANTE", 2: "INTERMEDIO", 3: "AVANZADO" };

  function calcularDificultadRutina(itemsCarrito) {
    if (!itemsCarrito.length) return null;
    const suma = itemsCarrito.reduce((acc, item) => {
      const ejercicio = GymRatData.getEjercicioPorId(item.idEjercicio);
      return acc + (ejercicio ? PESO_DIFICULTAD[ejercicio.dificultad] : 0);
    }, 0);
    const promedio = Math.max(1, Math.min(3, Math.round(suma / itemsCarrito.length)));
    return DIFICULTAD_POR_PESO[promedio];
  }

  function renderCatalogo() {
    const filtro = {
      grupoMuscular: grupoActivo || undefined,
      dificultad: filtroDificultadEl.value || undefined,
      texto: filtroTextoEl.value.trim() || undefined,
    };
    const resultados = GymRatData.filtrarEjercicios(filtro);
    contadorEl.textContent = resultados.length + (resultados.length === 1 ? " ejercicio" : " ejercicios");
    btnLimpiarFiltrosEl.classList.toggle("d-none", !hayFiltrosActivos());

    if (!resultados.length) {
      listaEjerciciosEl.innerHTML = "";
      sinResultadosEl.classList.remove("d-none");
      return;
    }
    sinResultadosEl.classList.add("d-none");

    const carrito = GymRatData.getCarrito();
    listaEjerciciosEl.innerHTML = resultados
      .map((e) => {
        const yaAgregado = carrito.some((item) => item.idEjercicio === e.idEjercicio);
        return `
      <div class="col-sm-6 col-lg-6 col-xl-4">
        <div class="card gr-card h-100 p-3 d-flex flex-column position-relative ${yaAgregado ? "is-en-rutina" : ""}">
          ${yaAgregado ? '<span class="gr-card-check" title="Ya está en tu rutina"><i class="bi bi-check-lg"></i></span>' : ""}
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="gr-icon-tile" style="width:2.75rem;height:2.75rem;font-size:1.2rem;flex-shrink:0;"><i class="bi bi-lightning-charge-fill"></i></div>
            <h6 class="card-title mb-0">${e.nombreEjercicio}</h6>
          </div>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span class="gr-group-pill"><i class="bi bi-tag-fill"></i>${e.grupoMuscular}</span>
            ${badgeDificultad(e.dificultad)}
          </div>
          <div class="d-flex gap-2 mt-auto">
            <a href="ejercicio-detalle.html?id=${e.idEjercicio}" class="btn btn-outline-secondary btn-sm flex-fill">Detalle</a>
            <button type="button" class="btn btn-sm flex-fill btn-agregar ${yaAgregado ? "btn-en-rutina" : "btn-brand"}" data-id="${e.idEjercicio}" ${yaAgregado ? "disabled" : ""}>
              ${yaAgregado ? '<i class="bi bi-check-lg"></i> En tu rutina' : "+ Agregar"}
            </button>
          </div>
        </div>
      </div>`;
      })
      .join("");
  }

  listaEjerciciosEl.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-agregar");
    if (!boton) return;
    GymRatData.agregarAlCarrito(boton.dataset.id);
    renderCatalogo();
    renderCarrito();
  });

  filtrosGrupoEl.addEventListener("click", (evento) => {
    const chip = evento.target.closest(".gr-filter-chip");
    if (!chip) return;
    filtrosGrupoEl.querySelectorAll(".gr-filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    grupoActivo = chip.dataset.grupo;
    renderCatalogo();
  });

  filtroDificultadEl.addEventListener("change", renderCatalogo);
  filtroTextoEl.addEventListener("input", renderCatalogo);
  btnLimpiarFiltrosEl.addEventListener("click", limpiarFiltros);
  btnLimpiarFiltrosVacioEl.addEventListener("click", limpiarFiltros);

  // ---------------------------------------------------------------
  // Constructor de rutina (carrito)
  // ---------------------------------------------------------------

  const carritoVacioEl = document.getElementById("carritoVacio");
  const listaCarritoEl = document.getElementById("listaCarrito");
  const formRutinaEl = document.getElementById("formRutina");
  const alertaRutinaEl = document.getElementById("alertaRutina");
  const fabRutinaEl = document.getElementById("fabRutina");
  const fabContadorEl = document.getElementById("fabContador");

  function renderCarrito() {
    const itemsCarrito = GymRatData.getCarrito();
    fabRutinaEl.classList.toggle("d-none", !itemsCarrito.length);
    fabContadorEl.textContent = itemsCarrito.length + (itemsCarrito.length === 1 ? " ejercicio" : " ejercicios");
    if (!itemsCarrito.length) {
      carritoVacioEl.classList.remove("d-none");
      listaCarritoEl.classList.add("d-none");
      formRutinaEl.classList.add("d-none");
      return;
    }
    carritoVacioEl.classList.add("d-none");
    listaCarritoEl.classList.remove("d-none");
    formRutinaEl.classList.remove("d-none");

    document.getElementById("dificultadCalculada").innerHTML = badgeDificultad(calcularDificultadRutina(itemsCarrito));

    listaCarritoEl.innerHTML = itemsCarrito
      .map((item) => {
        const ejercicio = GymRatData.getEjercicioPorId(item.idEjercicio);
        if (!ejercicio) return "";
        return `
      <li class="list-group-item">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span><strong>${ejercicio.nombreEjercicio}</strong> <span class="text-muted small">(${ejercicio.grupoMuscular})</span></span>
          <button type="button" class="btn btn-sm btn-outline-danger btn-quitar" data-id="${item.idEjercicio}">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="row g-2">
          <div class="col-4">
            <label class="form-label small mb-1">Series</label>
            <input type="number" class="form-control form-control-sm input-carrito" data-id="${item.idEjercicio}" data-campo="series" min="1" max="10" value="${item.series}">
          </div>
          <div class="col-4">
            <label class="form-label small mb-1">Repeticiones</label>
            <input type="number" class="form-control form-control-sm input-carrito" data-id="${item.idEjercicio}" data-campo="repeticiones" min="1" max="50" value="${item.repeticiones}">
          </div>
          <div class="col-4">
            <label class="form-label small mb-1">Descanso (s)</label>
            <input type="number" class="form-control form-control-sm input-carrito" data-id="${item.idEjercicio}" data-campo="descansoSegundos" min="0" max="600" step="5" value="${item.descansoSegundos}">
          </div>
        </div>
      </li>`;
      })
      .join("");
  }

  listaCarritoEl.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-quitar");
    if (!boton) return;
    GymRatData.quitarDelCarrito(boton.dataset.id);
    renderCarrito();
    renderCatalogo();
  });

  // Los inputs de series/repeticiones/descanso actualizan el carrito al
  // vuelo, sin necesidad de volver a dibujar toda la lista (para no
  // perder el foco mientras se escribe).
  listaCarritoEl.addEventListener("change", (evento) => {
    const input = evento.target.closest(".input-carrito");
    if (!input) return;
    const minimo = Number(input.min) || 0;
    const valor = Math.max(minimo, Number(input.value) || minimo);
    input.value = valor;
    GymRatData.actualizarItemCarrito(input.dataset.id, { [input.dataset.campo]: valor });
  });

  document.getElementById("btnVaciarCarrito").addEventListener("click", () => {
    GymRatData.vaciarCarrito();
    renderCarrito();
    renderCatalogo();
  });

  Validaciones.validarFormulario(
    formRutinaEl,
    {
      nombreRutina: (valor) => Validaciones.longitud(valor, 3, 60, "El nombre de la rutina"),
    },
    (datos) => {
      const sesion = GymRatData.getSesion();
      alertaRutinaEl.classList.remove("d-none", "alert-success", "alert-warning");

      if (!sesion) {
        alertaRutinaEl.classList.add("alert-warning");
        alertaRutinaEl.innerHTML = 'Debes <a href="login.html">iniciar sesión</a> para guardar tu rutina. Tu selección de ejercicios no se pierde.';
        return;
      }

      const itemsCarrito = GymRatData.getCarrito();
      const diasSeleccionados = datos.getAll("diasSemana");

      const nuevaRutina = GymRatData.crearRutina(
        {
          nombreRutina: datos.get("nombreRutina").trim(),
          dificultad: calcularDificultadRutina(itemsCarrito),
          dias: diasSeleccionados.length,
          ejercicios: itemsCarrito,
        },
        { atletaId: sesion.id }
      );

      // Si se eligieron dias, se agenda de una en "Mi semana" (mismo
      // storage que usa esa pantalla); se puede volver a cambiar
      // despues desde ahi sin ningun problema.
      diasSeleccionados.forEach((dia) => {
        GymRatData.asignarRutinaDia(sesion.id, dia, nuevaRutina.idRutina);
      });

      GymRatData.vaciarCarrito();
      formRutinaEl.reset();
      formRutinaEl.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
      alertaRutinaEl.classList.add("alert-success");
      alertaRutinaEl.innerHTML = diasSeleccionados.length
        ? '¡Rutina guardada y agendada con éxito! Puedes verla en <a href="mis-rutinas.html" class="alert-link">Mis rutinas</a> o en <a href="mi-semana.html" class="alert-link">Mi semana</a>.'
        : '¡Rutina guardada con éxito! Puedes ejecutarla desde <a href="mis-rutinas.html" class="alert-link">Mis rutinas</a>.';
      renderCarrito();
      renderCatalogo();
    }
  );

  renderCatalogo();
  renderCarrito();
});

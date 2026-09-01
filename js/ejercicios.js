/**
 * GymRat - Catalogo de ejercicios y constructor de rutina (ejercicios.html).
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

  function badgeDificultad(dificultad) {
    const clases = { PRINCIPIANTE: "gr-badge-outline", INTERMEDIO: "gr-badge-accent", AVANZADO: "gr-badge-red" };
    return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
  }

  function renderCatalogo() {
    const filtro = {
      grupoMuscular: grupoActivo || undefined,
      dificultad: filtroDificultadEl.value || undefined,
      texto: filtroTextoEl.value.trim() || undefined,
    };
    const resultados = GymRatData.filtrarEjercicios(filtro);
    contadorEl.textContent = resultados.length + (resultados.length === 1 ? " ejercicio" : " ejercicios");

    if (!resultados.length) {
      listaEjerciciosEl.innerHTML = "";
      sinResultadosEl.classList.remove("d-none");
      return;
    }
    sinResultadosEl.classList.add("d-none");

    const carrito = GymRatData.getCarrito();
    listaEjerciciosEl.innerHTML = resultados
      .map((e) => {
        const yaAgregado = carrito.includes(e.idEjercicio);
        return `
      <div class="col-md-4 col-lg-3">
        <div class="card gr-card h-100 p-3">
          <div class="gr-icon-tile mb-2"><i class="bi bi-lightning-charge-fill"></i></div>
          <h6 class="card-title mb-1">${e.nombreEjercicio}</h6>
          <p class="text-muted small mb-2">${e.grupoMuscular}</p>
          ${badgeDificultad(e.dificultad)}
          <div class="d-flex gap-2 mt-3">
            <a href="ejercicio-detalle.html?id=${e.idEjercicio}" class="btn btn-outline-secondary btn-sm flex-fill">Detalle</a>
            <button type="button" class="btn btn-brand btn-sm flex-fill btn-agregar" data-id="${e.idEjercicio}" ${yaAgregado ? "disabled" : ""}>
              ${yaAgregado ? "Agregado" : "+ Agregar"}
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

  // ---------------------------------------------------------------
  // Constructor de rutina (carrito)
  // ---------------------------------------------------------------

  const carritoVacioEl = document.getElementById("carritoVacio");
  const listaCarritoEl = document.getElementById("listaCarrito");
  const formRutinaEl = document.getElementById("formRutina");
  const alertaRutinaEl = document.getElementById("alertaRutina");

  function renderCarrito() {
    const idsCarrito = GymRatData.getCarrito();
    if (!idsCarrito.length) {
      carritoVacioEl.classList.remove("d-none");
      listaCarritoEl.classList.add("d-none");
      formRutinaEl.classList.add("d-none");
      return;
    }
    carritoVacioEl.classList.add("d-none");
    listaCarritoEl.classList.remove("d-none");
    formRutinaEl.classList.remove("d-none");

    const ejercicios = idsCarrito.map((id) => GymRatData.getEjercicioPorId(id)).filter(Boolean);
    listaCarritoEl.innerHTML = ejercicios
      .map(
        (e) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span><strong>${e.nombreEjercicio}</strong> <span class="text-muted small">(${e.grupoMuscular})</span></span>
        <button type="button" class="btn btn-sm btn-outline-danger btn-quitar" data-id="${e.idEjercicio}">
          <i class="bi bi-x-lg"></i>
        </button>
      </li>`
      )
      .join("");
  }

  listaCarritoEl.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".btn-quitar");
    if (!boton) return;
    GymRatData.quitarDelCarrito(boton.dataset.id);
    renderCarrito();
    renderCatalogo();
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
      dificultadRutina: (valor) => Validaciones.seleccionRequerida(valor, "una dificultad"),
      diasRutina: (valor) => Validaciones.numeroEnRango(valor, 1, 7, "Los días por semana"),
    },
    (datos) => {
      const sesion = GymRatData.getSesion();
      alertaRutinaEl.classList.remove("d-none", "alert-success", "alert-warning");

      if (!sesion) {
        alertaRutinaEl.classList.add("alert-warning");
        alertaRutinaEl.innerHTML = 'Debes <a href="login.html">iniciar sesión</a> para guardar tu rutina. Tu selección de ejercicios no se pierde.';
        return;
      }

      GymRatData.crearRutina(
        {
          nombreRutina: datos.get("nombreRutina").trim(),
          dificultad: datos.get("dificultadRutina"),
          dias: datos.get("diasRutina"),
          ejerciciosIds: GymRatData.getCarrito(),
        },
        { atletaId: sesion.id }
      );

      GymRatData.vaciarCarrito();
      formRutinaEl.reset();
      formRutinaEl.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
      alertaRutinaEl.classList.add("alert-success");
      alertaRutinaEl.textContent = "¡Rutina guardada con éxito!";
      renderCarrito();
      renderCatalogo();
    }
  );

  renderCatalogo();
  renderCarrito();
});

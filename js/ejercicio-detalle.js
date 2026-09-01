/**
 * GymRat - Detalle de un ejercicio (ejercicio-detalle.html?id=N).
 */
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavSesion("");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const ejercicio = id ? GymRatData.getEjercicioPorId(id) : null;

  const contenedorDetalle = document.getElementById("detalleEjercicio");
  const noEncontradoEl = document.getElementById("noEncontrado");
  const listaRelacionadosEl = document.getElementById("listaRelacionados");

  if (!ejercicio) {
    noEncontradoEl.classList.remove("d-none");
    return;
  }

  document.title = ejercicio.nombreEjercicio + " | GymRat";

  function badgeDificultad(dificultad) {
    const clases = { PRINCIPIANTE: "gr-badge-outline", INTERMEDIO: "gr-badge-accent", AVANZADO: "gr-badge-red" };
    return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
  }

  const yaAgregado = GymRatData.getCarrito().includes(ejercicio.idEjercicio);

  contenedorDetalle.innerHTML = `
    <div class="card gr-card p-4 p-lg-5">
      <div class="row g-4 align-items-center">
        <div class="col-md-3 text-center">
          <div class="gr-icon-tile mx-auto" style="width:5rem;height:5rem;font-size:2.2rem;">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
        </div>
        <div class="col-md-9">
          <h1 class="h3 mb-2">${ejercicio.nombreEjercicio}</h1>
          <p class="text-muted mb-2">Grupo muscular: <strong>${ejercicio.grupoMuscular}</strong></p>
          ${badgeDificultad(ejercicio.dificultad)}
          <div class="mt-4 d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-brand" id="btnAgregarDetalle" ${yaAgregado ? "disabled" : ""}>
              ${yaAgregado ? "Ya está en tu rutina" : "+ Agregar a mi rutina"}
            </button>
            <a href="ejercicios.html" class="btn btn-outline-secondary">Ver catálogo completo</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const btnAgregar = document.getElementById("btnAgregarDetalle");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      GymRatData.agregarAlCarrito(ejercicio.idEjercicio);
      btnAgregar.disabled = true;
      btnAgregar.textContent = "Ya está en tu rutina";
    });
  }

  const relacionados = GymRatData.filtrarEjercicios({ grupoMuscular: ejercicio.grupoMuscular }).filter(
    (e) => e.idEjercicio !== ejercicio.idEjercicio
  );

  listaRelacionadosEl.innerHTML = relacionados.length
    ? relacionados
        .slice(0, 4)
        .map(
          (e) => `
      <div class="col-md-3 col-6">
        <a href="ejercicio-detalle.html?id=${e.idEjercicio}" class="text-decoration-none">
          <div class="card gr-card h-100 p-3">
            <h6 class="card-title mb-1">${e.nombreEjercicio}</h6>
            ${badgeDificultad(e.dificultad)}
          </div>
        </a>
      </div>`
        )
        .join("")
    : '<p class="text-muted">No hay más ejercicios en este grupo muscular todavía.</p>';
});

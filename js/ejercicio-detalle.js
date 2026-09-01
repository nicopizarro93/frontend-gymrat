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

  const yaAgregado = GymRatData.getCarrito().some((item) => item.idEjercicio === ejercicio.idEjercicio);

  contenedorDetalle.innerHTML = `
    <div class="card gr-card p-4 p-lg-5 position-relative">
      ${yaAgregado ? '<span class="gr-card-check" style="top:1rem;right:1rem;" title="Ya está en tu rutina"><i class="bi bi-check-lg"></i></span>' : ""}
      <div class="row g-4 align-items-center">
        <div class="col-md-3 text-center">
          <div class="gr-icon-tile mx-auto" style="width:5rem;height:5rem;font-size:2.2rem;">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
        </div>
        <div class="col-md-9">
          <h1 class="h3 mb-3">${ejercicio.nombreEjercicio}</h1>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <span class="gr-group-pill"><i class="bi bi-tag-fill"></i>${ejercicio.grupoMuscular}</span>
            ${badgeDificultad(ejercicio.dificultad)}
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button type="button" class="btn ${yaAgregado ? "btn-en-rutina" : "btn-brand"}" id="btnAgregarDetalle" ${yaAgregado ? "disabled" : ""}>
              ${yaAgregado ? '<i class="bi bi-check-lg"></i> Ya está en tu rutina' : "+ Agregar a mi rutina"}
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
      btnAgregar.classList.remove("btn-brand");
      btnAgregar.classList.add("btn-en-rutina");
      btnAgregar.innerHTML = '<i class="bi bi-check-lg"></i> Ya está en tu rutina';
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
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="gr-icon-tile" style="width:2.25rem;height:2.25rem;font-size:1rem;flex-shrink:0;"><i class="bi bi-lightning-charge-fill"></i></div>
              <h6 class="card-title mb-0">${e.nombreEjercicio}</h6>
            </div>
            ${badgeDificultad(e.dificultad)}
          </div>
        </a>
      </div>`
        )
        .join("")
    : '<p class="text-muted">No hay más ejercicios en este grupo muscular todavía.</p>';
});

/**
 * GymRat - Logica especifica de la pagina de inicio (index.html).
 * Rellena las estadisticas rapidas y las tarjetas destacadas usando
 * la capa de datos mock (GymRatData).
 */
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavSesion("");

  const ejercicios = GymRatData.getEjercicios();
  const rutinas = GymRatData.getRutinas();
  const atletas = GymRatData.getAtletas();
  const grupos = new Set(ejercicios.map((e) => e.grupoMuscular));

  document.getElementById("statEjercicios").textContent = ejercicios.length;
  document.getElementById("statRutinas").textContent = rutinas.length;
  document.getElementById("statAtletas").textContent = atletas.length;
  document.getElementById("statGrupos").textContent = grupos.size;

  renderEjerciciosDestacados(ejercicios.slice(0, 3));
  renderRutinasDestacadas(rutinas.slice(0, 3));
});

function badgeDificultad(dificultad) {
  const clases = {
    PRINCIPIANTE: "gr-badge-outline",
    INTERMEDIO: "gr-badge-accent",
    AVANZADO: "gr-badge-red",
  };
  return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
}

function renderEjerciciosDestacados(lista) {
  const contenedor = document.getElementById("listaEjerciciosDestacados");
  contenedor.innerHTML = lista
    .map(
      (e) => `
    <div class="col-md-4">
      <div class="card gr-card-dark h-100 p-3">
        <div class="gr-icon-tile mb-3"><i class="bi bi-lightning-charge-fill"></i></div>
        <div class="card-body p-0">
          <h5 class="card-title">${e.nombreEjercicio}</h5>
          <p class="mb-2 text-muted small">${e.grupoMuscular}</p>
          ${badgeDificultad(e.dificultad)}
        </div>
      </div>
    </div>`
    )
    .join("");
}

function renderRutinasDestacadas(lista) {
  const contenedor = document.getElementById("listaRutinasDestacadas");
  contenedor.innerHTML = lista
    .map(
      (r) => `
    <div class="col-md-4">
      <div class="card gr-card-dark h-100 p-4">
        <h5 class="card-title">${r.nombreRutina}</h5>
        <p class="text-muted small mb-3">${r.dias} días por semana &middot; ${r.ejerciciosIds.length} ejercicios</p>
        ${badgeDificultad(r.dificultad)}
      </div>
    </div>`
    )
    .join("");
}

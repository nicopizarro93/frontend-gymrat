/**
 * GymRat - Mis Rutinas (mis-rutinas.html).
 * Pagina dedicada a las rutinas guardadas por el atleta con sesion activa
 * (separada de Mi Perfil para no mezclar "cuenta" con "contenido").
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ redirigirA: "login.html" });
  if (!sesion) return;

  actualizarNavSesion("");
  renderRutinas();
});

function badgeDificultad(dificultad) {
  const clases = { PRINCIPIANTE: "gr-badge-outline", INTERMEDIO: "gr-badge-accent", AVANZADO: "gr-badge-red" };
  return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
}

function renderRutinas() {
  const sesion = GymRatData.getSesion();
  const rutinas = GymRatData.getRutinasPorAtleta(sesion.id);
  const listaEl = document.getElementById("listaRutinas");
  const vacioEl = document.getElementById("estadoVacio");
  const contadorEl = document.getElementById("contadorRutinas");

  contadorEl.textContent = rutinas.length
    ? rutinas.length + (rutinas.length === 1 ? " rutina guardada" : " rutinas guardadas")
    : "Aún no has guardado ninguna rutina";

  if (!rutinas.length) {
    vacioEl.classList.remove("d-none");
    listaEl.innerHTML = "";
    return;
  }
  vacioEl.classList.add("d-none");

  listaEl.innerHTML = rutinas
    .map((r) => {
      const completa = GymRatData.getRutinaCompleta(r.idRutina);
      const idColapso = "detalle-rutina-" + r.idRutina;
      const listaEjercicios = completa.ejercicios.length
        ? '<ul class="list-unstyled small text-muted mb-0">' +
          completa.ejercicios
            .map((e) => `<li><i class="bi bi-check2 text-brand-red me-1"></i>${e.nombreEjercicio} <strong>${e.series}×${e.repeticiones}</strong> <span class="text-muted">(${e.grupoMuscular})</span></li>`)
            .join("") +
          "</ul>"
        : '<p class="small text-muted mb-0">Sin ejercicios asociados.</p>';

      const ejecucion = GymRatData.getEjecucion(r.idRutina);
      const totalEjercicios = completa.ejercicios.length;
      const completados = Object.values(ejecucion.progreso).filter((p) => p.completado).length;
      const rutinaCompletada = totalEjercicios > 0 && completados === totalEjercicios;
      const enProgreso = completados > 0 && !rutinaCompletada;

      let badgeEstado = "";
      let textoBoton = "Ejecutar rutina";
      if (rutinaCompletada) {
        badgeEstado = '<span class="gr-badge gr-badge-accent">Completada</span>';
        textoBoton = "Repetir rutina";
      } else if (enProgreso) {
        badgeEstado = '<span class="gr-badge gr-badge-outline">En progreso (' + completados + "/" + totalEjercicios + ")</span>";
        textoBoton = "Continuar";
      }

      return `
      <div class="col-md-6 col-lg-4">
        <div class="card gr-card h-100 p-4 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0">${r.nombreRutina}</h5>
            ${badgeDificultad(r.dificultad)}
          </div>
          <p class="text-muted small mb-2">
            <i class="bi bi-calendar3 me-1"></i>${r.dias} días/semana &middot;
            <i class="bi bi-lightning-charge ms-1 me-1"></i>${totalEjercicios} ejercicios
          </p>
          ${badgeEstado ? '<div class="mb-2">' + badgeEstado + "</div>" : ""}

          <button type="button" class="btn btn-sm btn-outline-secondary align-self-start mb-2" data-bs-toggle="collapse" data-bs-target="#${idColapso}">
            <i class="bi bi-chevron-down"></i> Ver ejercicios
          </button>
          <div class="collapse mb-3" id="${idColapso}">
            ${listaEjercicios}
          </div>

          <div class="d-flex gap-2 mt-auto">
            <a href="ejecutar-rutina.html?id=${r.idRutina}" class="btn btn-brand btn-sm flex-fill">
              <i class="bi bi-play-fill"></i> ${textoBoton}
            </a>
            <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-rutina" data-id="${r.idRutina}" title="Eliminar rutina">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  listaEl.querySelectorAll(".btn-eliminar-rutina").forEach((boton) => {
    boton.addEventListener("click", () => {
      const confirmado = window.confirm("¿Eliminar esta rutina? Esta acción no se puede deshacer.");
      if (!confirmado) return;
      GymRatData.eliminarRutina(boton.dataset.id);
      renderRutinas();
    });
  });
}

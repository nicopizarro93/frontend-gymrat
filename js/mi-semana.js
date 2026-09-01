/**
 * GymRat - Mi semana (mi-semana.html).
 *
 * Funcionalidad SOLO MOCK: el backend real no tiene ningun concepto de
 * calendario ni de "rutina asignada a un dia". El horario se guarda por
 * atleta en localStorage a traves de GymRatData.getHorario/asignarRutinaDia
 * (ver mock-data.js, seccion "Mi semana"). Cada dia de la semana (LUNES a
 * DOMINGO, en general, no una fecha puntual) puede tener como maximo una
 * rutina asignada; la misma rutina se puede repetir en varios dias.
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ redirigirA: "login.html" });
  if (!sesion) return;

  actualizarNavSesion("");

  const rutinas = GymRatData.getRutinasPorAtleta(sesion.id);
  const diaHoy = GymRatData.getDiaDeHoy();

  const NOMBRES_DIA = {
    LUNES: "Lunes",
    MARTES: "Martes",
    MIERCOLES: "Miércoles",
    JUEVES: "Jueves",
    VIERNES: "Viernes",
    SABADO: "Sábado",
    DOMINGO: "Domingo",
  };
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  const estadoSinRutinasEl = document.getElementById("estadoSinRutinas");
  const contenidoSemanaEl = document.getElementById("contenidoSemana");

  if (!rutinas.length) {
    estadoSinRutinasEl.classList.remove("d-none");
    contenidoSemanaEl.classList.add("d-none");
    return;
  }
  estadoSinRutinasEl.classList.add("d-none");
  contenidoSemanaEl.classList.remove("d-none");

  // Fechas de la semana actual (lunes a domingo), solo para mostrar
  // "Lunes 1 sep" junto a cada dia. No se guarda ninguna fecha: la
  // asignacion es por dia de la semana en general, asi que se repite
  // igual la semana siguiente.
  function fechasSemanaActual() {
    const hoy = new Date();
    const diaJs = hoy.getDay(); // 0 = domingo
    const offsetLunes = diaJs === 0 ? -6 : 1 - diaJs;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + offsetLunes);
    return GymRatData.DIAS_SEMANA.map((_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }
  const fechas = fechasSemanaActual();

  function formatoFecha(d) {
    return d.getDate() + " " + MESES[d.getMonth()];
  }

  function badgeDificultad(dificultad) {
    const clases = { PRINCIPIANTE: "gr-badge-outline", INTERMEDIO: "gr-badge-accent", AVANZADO: "gr-badge-red" };
    return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
  }

  function opcionesRutinas(seleccionadoId) {
    return (
      '<option value="">Sin rutina asignada</option>' +
      rutinas
        .map(
          (r) =>
            '<option value="' +
            r.idRutina +
            '"' +
            (Number(seleccionadoId) === r.idRutina ? " selected" : "") +
            ">" +
            r.nombreRutina +
            "</option>"
        )
        .join("")
    );
  }

  function render() {
    const horario = GymRatData.getHorario(sesion.id);
    renderHoy(horario);
    renderGrilla(horario);
  }

  function renderHoy(horario) {
    const idHoy = horario[diaHoy];
    const el = document.getElementById("tarjetaHoy");
    const indiceHoy = GymRatData.DIAS_SEMANA.indexOf(diaHoy);
    const fechaHoyTxt = NOMBRES_DIA[diaHoy] + " · " + formatoFecha(fechas[indiceHoy]);

    if (!idHoy) {
      el.innerHTML =
        '<p class="text-muted small mb-1 text-uppercase" style="letter-spacing:.05em;">Hoy · ' +
        fechaHoyTxt.split(" · ")[1] +
        "</p>" +
        '<h2 class="h4 mb-3">Todavía no tienes una rutina asignada para hoy</h2>' +
        '<div class="d-flex flex-wrap gap-2 align-items-center">' +
        '<select class="form-select" style="max-width:320px;" id="selectorHoy">' +
        opcionesRutinas(null) +
        "</select>" +
        "</div>";

      document.getElementById("selectorHoy").addEventListener("change", (ev) => {
        GymRatData.asignarRutinaDia(sesion.id, diaHoy, ev.target.value || null);
        render();
      });
      return;
    }

    const rutina = GymRatData.getRutinaCompleta(idHoy);
    el.innerHTML =
      '<p class="text-muted small mb-1 text-uppercase" style="letter-spacing:.05em;">Hoy · ' +
      fechaHoyTxt.split(" · ")[1] +
      "</p>" +
      '<div class="d-flex flex-wrap justify-content-between align-items-end gap-3">' +
      "<div>" +
      '<h2 class="h3 mb-2">' +
      rutina.nombreRutina +
      "</h2>" +
      '<div class="d-flex flex-wrap gap-2">' +
      badgeDificultad(rutina.dificultad) +
      '<span class="gr-group-pill"><i class="bi bi-lightning-charge-fill"></i>' +
      rutina.ejercicios.length +
      " ejercicios</span>" +
      "</div>" +
      "</div>" +
      '<a href="ejecutar-rutina.html?id=' +
      idHoy +
      '" class="btn btn-brand btn-lg"><i class="bi bi-play-fill"></i> Ejecutar rutina de hoy</a>' +
      "</div>";
  }

  function renderGrilla(horario) {
    const el = document.getElementById("grillaSemana");
    el.innerHTML = GymRatData.DIAS_SEMANA.map((dia, i) => {
      const idAsignado = horario[dia];
      const esHoy = dia === diaHoy;
      const rutina = idAsignado ? GymRatData.getRutinaCompleta(idAsignado) : null;

      const infoRutina = rutina
        ? '<div class="mt-auto">' +
          '<div class="d-flex flex-wrap gap-2 mb-2">' +
          badgeDificultad(rutina.dificultad) +
          "</div>" +
          '<a href="ejecutar-rutina.html?id=' +
          idAsignado +
          '" class="btn btn-outline-secondary btn-sm w-100">Ejecutar</a>' +
          "</div>"
        : '<p class="small text-muted mt-auto mb-0">Descanso / sin asignar</p>';

      return (
        '<div class="col-6 col-md-4 col-lg-3">' +
        '<div class="card gr-card h-100 p-3 d-flex flex-column ' +
        (esHoy ? "is-hoy" : "") +
        '">' +
        (esHoy ? '<span class="gr-badge gr-badge-accent align-self-start mb-2">HOY</span>' : "") +
        '<p class="mb-0 fw-semibold" style="font-family:var(--font-display);letter-spacing:.04em;">' +
        NOMBRES_DIA[dia] +
        "</p>" +
        '<p class="small text-muted mb-3">' +
        formatoFecha(fechas[i]) +
        "</p>" +
        '<select class="form-select form-select-sm mb-3 selector-dia" data-dia="' +
        dia +
        '">' +
        opcionesRutinas(idAsignado) +
        "</select>" +
        infoRutina +
        "</div>" +
        "</div>"
      );
    }).join("");

    el.querySelectorAll(".selector-dia").forEach((select) => {
      select.addEventListener("change", (ev) => {
        GymRatData.asignarRutinaDia(sesion.id, select.dataset.dia, ev.target.value || null);
        render();
      });
    });
  }

  render();
});

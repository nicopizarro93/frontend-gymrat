/**
 * GymRat - Ejecucion de una rutina (ejecutar-rutina.html).
 *
 * Funcionalidad SOLO MOCK: el backend real (Rutina.java) no tiene ningun
 * concepto de "ejecutar" una rutina, ni de series/repeticiones/descanso
 * por ejercicio. Todo el estado de esta pantalla se guarda en
 * localStorage a traves de GymRatData.getEjecucion/guardarEjecucion
 * (ver mock-data.js, seccion "Ejecucion de una rutina").
 *
 * Flujo implementado (confirmado con el usuario antes de programar):
 * - Al abrir un ejercicio se ve directamente la serie activa
 *   ("Serie X de Y - N repeticiones") con un solo boton "Listo" (sin
 *   boton "Empezar" separado).
 * - Al presionar "Listo" se cuenta esa serie como hecha; si quedan mas
 *   series, arranca automaticamente el descanso con cronometro
 *   regresivo. Si era la ultima serie, el ejercicio queda marcado como
 *   completado (sin descanso final) y el foco avanza al siguiente
 *   ejercicio pendiente.
 * - El descanso se guarda como una marca de tiempo absoluta
 *   (descansoHasta = Date.now() + segundos) para que sobreviva a un
 *   refresh de la pagina: el tiempo restante siempre se recalcula,
 *   nunca se resta de un contador.
 * - Contar series (progreso) es independiente de mostrar el
 *   cronometro: si el descanso se pierde de vista o se salta, el
 *   progreso ya guardado no se ve afectado.
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ redirigirA: "login.html" });
  if (!sesion) return;

  actualizarNavSesion("");

  const idRutina = Number(new URLSearchParams(window.location.search).get("id"));
  const rutinaBase = GymRatData.getRutinaPorId(idRutina);
  const rutina = GymRatData.getRutinaCompleta(idRutina);

  const perteneceAlAtleta =
    rutinaBase && (rutinaBase.atletaId === null || rutinaBase.atletaId === undefined || rutinaBase.atletaId === sesion.id);
  const puedeEjecutar = rutina && rutina.ejercicios.length && (perteneceAlAtleta || GymRatData.esStaff());

  if (!puedeEjecutar) {
    document.getElementById("cargando").classList.add("d-none");
    document.getElementById("estadoError").classList.remove("d-none");
    return;
  }

  let estado = GymRatData.getEjecucion(idRutina);
  let abiertoId = calcularEjercicioInicial();
  const tituloOriginal = document.title;

  document.getElementById("cargando").classList.add("d-none");
  document.getElementById("contenidoRutina").classList.remove("d-none");
  document.getElementById("nombreRutina").textContent = rutina.nombreRutina;
  document.getElementById("metaRutina").textContent =
    rutina.dificultad + " · " + rutina.dias + " días/semana · " + rutina.ejercicios.length + " ejercicios";

  function calcularEjercicioInicial() {
    if (estado.descansoActivo) return estado.descansoActivo.idEjercicio;
    const pendiente = rutina.ejercicios.find((e) => !estado.progreso[e.idEjercicio].completado);
    return pendiente ? pendiente.idEjercicio : null;
  }

  function formatoTiempo(segundos) {
    const s = Math.max(0, Math.ceil(segundos));
    const m = Math.floor(s / 60);
    const resto = s % 60;
    return String(m).padStart(2, "0") + ":" + String(resto).padStart(2, "0");
  }

  // Beep corto via Web Audio API cuando termina el descanso (util porque
  // el usuario probablemente no esta mirando la pantalla mientras hace
  // sus repeticiones). Si el navegador bloquea o no soporta audio, se
  // ignora en silencio: el cronometro visual sigue funcionando igual.
  function reproducirBeep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      /* audio no disponible: se ignora */
    }
  }

  function render() {
    const total = rutina.ejercicios.length;
    const completados = rutina.ejercicios.filter((e) => estado.progreso[e.idEjercicio].completado).length;
    const todoCompletado = completados === total;

    document.getElementById("progresoTexto").textContent = completados + "/" + total + " ejercicios";
    document.getElementById("barraProgreso").style.width = (total ? (completados / total) * 100 : 0) + "%";
    document.getElementById("bannerCompletado").classList.toggle("d-none", !todoCompletado);
    document.getElementById("listaEjercicios").classList.toggle("d-none", todoCompletado);

    if (todoCompletado) return;

    document.getElementById("listaEjercicios").innerHTML = rutina.ejercicios.map(renderFila).join("");

    document.querySelectorAll(".gr-exercise-head").forEach((head) => {
      head.addEventListener("click", () => {
        const id = Number(head.dataset.id);
        abiertoId = abiertoId === id ? null : id;
        render();
      });
    });
    document.querySelectorAll(".btn-serie-lista").forEach((boton) => {
      boton.addEventListener("click", (ev) => {
        ev.stopPropagation();
        marcarSerieLista(Number(boton.dataset.id));
      });
    });
    document.querySelectorAll(".btn-saltar-descanso").forEach((boton) => {
      boton.addEventListener("click", (ev) => {
        ev.stopPropagation();
        estado.descansoActivo = null;
        GymRatData.guardarEjecucion(idRutina, estado);
        render();
      });
    });
  }

  function renderFila(ejercicio) {
    const item = estado.progreso[ejercicio.idEjercicio];
    const completado = item.completado;
    const abierto = abiertoId === ejercicio.idEjercicio;
    const clases = ["gr-exercise-row", "p-3"];
    if (completado) clases.push("is-completado");
    else if (abierto) clases.push("is-activo");

    const icono = completado
      ? '<i class="bi bi-check-circle-fill text-accent fs-4"></i>'
      : abierto
      ? '<i class="bi bi-play-circle-fill text-brand-red fs-4"></i>'
      : '<i class="bi bi-circle text-muted fs-4"></i>';

    let detalle = "";
    if (abierto) {
      // Gif de demostracion (ver gifUrl en mock-data.js, solo mock) - se
      // muestra en todo ejercicio expandido, sin importar el estado
      // (completado, en descanso o en serie activa), para poder revisar
      // la tecnica sin salir de la pantalla de ejecucion.
      const mediaHtml = ejercicio.gifUrl
        ? '<div class="gr-ejercicio-media gr-ejercicio-media-mini"><img src="' +
          ejercicio.gifUrl +
          '" alt="Demostración de ' +
          ejercicio.nombreEjercicio +
          '" loading="lazy"></div>'
        : '<div class="gr-ejercicio-media gr-ejercicio-media-mini gr-ejercicio-media-vacia"><div class="gr-icon-tile mx-auto"><i class="bi bi-lightning-charge-fill"></i></div></div>';

      if (completado) {
        detalle =
          '<div class="mt-3 pt-3 border-top" style="border-color:var(--gr-light-border) !important;">' +
          mediaHtml +
          '<p class="small text-muted mb-0 text-center"><i class="bi bi-check2-all me-1"></i>Ejercicio completado — ' +
          ejercicio.series + " series × " + ejercicio.repeticiones + " repeticiones.</p></div>";
      } else {
        const descansoActivo =
          estado.descansoActivo && estado.descansoActivo.idEjercicio === ejercicio.idEjercicio ? estado.descansoActivo : null;

        const dots = Array.from({ length: ejercicio.series }, (_, i) => {
          let clase = "gr-set-dot";
          if (i < item.serieActual) clase += " is-hecha";
          else if (i === item.serieActual) clase += " is-actual";
          return '<span class="' + clase + '">' + (i + 1) + "</span>";
        }).join("");

        if (descansoActivo) {
          const restante = Math.max(0, (descansoActivo.descansoHasta - Date.now()) / 1000);
          detalle =
            '<div class="mt-3 pt-3 border-top text-center" style="border-color:var(--gr-light-border) !important;">' +
            mediaHtml +
            '<p class="small text-muted mb-1">Descanso — preparando serie ' + (item.serieActual + 1) + " de " + ejercicio.series + "</p>" +
            '<div class="gr-timer-display mb-2" id="temporizador-' + ejercicio.idEjercicio + '">' + formatoTiempo(restante) + "</div>" +
            '<button type="button" class="btn btn-sm btn-brand-outline btn-saltar-descanso" data-id="' + ejercicio.idEjercicio + '">Saltar descanso</button>' +
            "</div>";
        } else {
          detalle =
            '<div class="mt-3 pt-3 border-top" style="border-color:var(--gr-light-border) !important;">' +
            mediaHtml +
            '<div class="d-flex flex-wrap gap-2 justify-content-center mb-3">' + dots + "</div>" +
            '<p class="text-center mb-3">Serie <strong>' + (item.serieActual + 1) + "</strong> de " + ejercicio.series +
            " · <strong>" + ejercicio.repeticiones + "</strong> repeticiones</p>" +
            '<button type="button" class="btn btn-brand w-100 btn-serie-lista" data-id="' + ejercicio.idEjercicio + '">' +
            '<i class="bi bi-check-lg"></i> Listo</button>' +
            '<p class="small text-muted text-center mt-2 mb-0">Descanso entre series: ' + ejercicio.descansoSegundos + " s</p>" +
            "</div>";
        }
      }
    }

    return (
      '<div class="' + clases.join(" ") + '">' +
      '<div class="d-flex align-items-center gap-3 gr-exercise-head" data-id="' + ejercicio.idEjercicio + '">' +
      icono +
      '<div class="flex-grow-1">' +
      '<p class="mb-0 fw-semibold">' + ejercicio.nombreEjercicio + "</p>" +
      '<p class="small text-muted mb-0">' + ejercicio.grupoMuscular + " · " + ejercicio.series + "×" + ejercicio.repeticiones + "</p>" +
      "</div>" +
      (completado ? '<span class="gr-badge gr-badge-accent">Hecho</span>' : "") +
      '<i class="bi ' + (abierto ? "bi-chevron-up" : "bi-chevron-down") + ' text-muted"></i>' +
      "</div>" +
      detalle +
      "</div>"
    );
  }

  function marcarSerieLista(idEjercicio) {
    const ejercicio = rutina.ejercicios.find((e) => e.idEjercicio === idEjercicio);
    const item = estado.progreso[idEjercicio];
    if (!ejercicio || !item || item.completado) return;

    item.serieActual += 1;
    if (item.serieActual >= ejercicio.series) {
      item.completado = true;
      estado.descansoActivo = null;
      const siguiente = rutina.ejercicios.find((e) => !estado.progreso[e.idEjercicio].completado);
      abiertoId = siguiente ? siguiente.idEjercicio : null;
    } else if (ejercicio.descansoSegundos > 0) {
      estado.descansoActivo = { idEjercicio: idEjercicio, descansoHasta: Date.now() + ejercicio.descansoSegundos * 1000 };
    }
    GymRatData.guardarEjecucion(idRutina, estado);
    render();
  }

  document.getElementById("btnRepetirRutina").addEventListener("click", () => {
    estado = GymRatData.iniciarEjecucion(idRutina);
    abiertoId = rutina.ejercicios[0] ? rutina.ejercicios[0].idEjercicio : null;
    render();
  });

  render();

  // Cronometro: cada 250ms recalcula el tiempo restante desde la marca
  // de tiempo absoluta guardada (no desde un contador en memoria), asi
  // que sobrevive a un refresh de la pagina. Solo actualiza el numero en
  // pantalla (si el panel del ejercicio esta abierto); no vuelve a
  // dibujar toda la lista salvo cuando el descanso termina.
  setInterval(() => {
    if (!estado.descansoActivo) {
      if (document.title !== tituloOriginal) document.title = tituloOriginal;
      return;
    }
    const restante = (estado.descansoActivo.descansoHasta - Date.now()) / 1000;
    if (restante <= 0) {
      estado.descansoActivo = null;
      GymRatData.guardarEjecucion(idRutina, estado);
      document.title = tituloOriginal;
      reproducirBeep();
      render();
      return;
    }
    document.title = "⏱ " + formatoTiempo(restante) + " · Descanso";
    const el = document.getElementById("temporizador-" + estado.descansoActivo.idEjercicio);
    if (el) el.textContent = formatoTiempo(restante);
  }, 250);
});

/**
 * GymRat - Logica especifica de la pagina de inicio (index.html).
 * Rellena las estadisticas rapidas y las tarjetas destacadas usando
 * la capa de datos mock (GymRatData), y adapta el hero segun si hay
 * una sesion activa (ver actualizarHeroSesion) para no seguir invitando
 * a "crear cuenta" a alguien que ya inicio sesion.
 */
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavSesion("");
  actualizarHeroSesion();
  actualizarFooterSesion();

  const ejercicios = GymRatData.getEjercicios();
  const rutinas = GymRatData.getRutinas();
  const atletas = GymRatData.getAtletas();
  const grupos = new Set(ejercicios.map((e) => e.grupoMuscular));

  document.getElementById("statEjercicios").textContent = ejercicios.length;
  document.getElementById("statRutinas").textContent = rutinas.length;
  document.getElementById("statAtletas").textContent = atletas.length;
  document.getElementById("statGrupos").textContent = grupos.size;

  renderGruposMusculares(ejercicios);
  renderEjerciciosDestacados(ejercicios.slice(0, 3));
  renderRutinasDestacadas(rutinas.slice(0, 3));
});

// Metadata SOLO de presentacion (nombre bonito + icono) para cada valor
// de GymRatData.GRUPOS_MUSCULARES; el conteo de cada tarjeta sale del
// catalogo real, no de un numero fijo, para que quede correcto apenas
// se agreguen o quiten ejercicios.
const GRUPOS_INFO = [
  { clave: "PECHO", nombre: "Pecho", icono: "bi-shield-fill" },
  { clave: "ESPALDA", nombre: "Espalda", icono: "bi-arrow-left-right" },
  { clave: "PIERNA", nombre: "Pierna", icono: "bi-bicycle" },
  { clave: "HOMBRO", nombre: "Hombro", icono: "bi-arrows-angle-expand" },
  { clave: "BICEP", nombre: "Bícep", icono: "bi-hand-thumbs-up-fill" },
  { clave: "TRICEP", nombre: "Trícep", icono: "bi-arrows-collapse" },
  { clave: "ABDOMEN", nombre: "Abdomen", icono: "bi-grid-3x2-gap-fill" },
];

/**
 * Tarjetas "Explora por grupo muscular" en la home: un acceso directo
 * por categoria hacia el catalogo (ejercicios.html?grupo=X), con el
 * numero real de ejercicios de esa categoria. ejercicios.js lee ese
 * query string y preselecciona el chip de filtro correspondiente.
 */
function renderGruposMusculares(ejercicios) {
  const contenedor = document.getElementById("listaGrupos");
  if (!contenedor) return;
  contenedor.innerHTML = GRUPOS_INFO.map((grupo) => {
    const cantidad = ejercicios.filter((e) => e.grupoMuscular === grupo.clave).length;
    return `
    <div class="col-6 col-lg-3">
      <a href="ejercicios.html?grupo=${grupo.clave}" class="card gr-card-dark h-100 p-3 d-block text-decoration-none text-reset">
        <div class="gr-icon-tile mb-3"><i class="bi ${grupo.icono}"></i></div>
        <h6 class="card-title mb-1">${grupo.nombre}</h6>
        <p class="small text-muted mb-0">${cantidad} ejercicio${cantidad === 1 ? "" : "s"}</p>
      </a>
    </div>`;
  }).join("");
}

function badgeDificultad(dificultad) {
  const clases = {
    PRINCIPIANTE: "gr-badge-outline",
    INTERMEDIO: "gr-badge-accent",
    AVANZADO: "gr-badge-red",
  };
  return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
}

/**
 * Si hay una sesion activa, reemplaza el hero de marketing ("Crear cuenta
 * gratis") por una bienvenida personalizada: si el atleta ya tiene una
 * rutina asignada para hoy (ver GymRatData.getHorario / getDiaDeHoy, de
 * "Mi semana") la muestra con acceso directo a ejecutarla; si tiene
 * rutinas pero ninguna asignada hoy, invita a asignar una en Mi semana;
 * si todavia no tiene ninguna rutina guardada, invita a crear la primera.
 * Sin sesion activa se deja intacto el hero por defecto del HTML.
 */
function actualizarHeroSesion() {
  const sesion = GymRatData.getSesion();
  if (!sesion) return;

  document.getElementById("heroAnonimo").classList.add("d-none");
  const heroSesion = document.getElementById("heroSesion");
  heroSesion.classList.remove("d-none");

  const primerNombre = sesion.nombre.split(" ")[0];
  const partes = sesion.nombre.trim().split(/\s+/);
  const iniciales = ((partes[0] ? partes[0][0] : "") + (partes[1] ? partes[1][0] : "")).toUpperCase();
  document.getElementById("heroAvatar").textContent = iniciales;

  const tituloEl = document.getElementById("heroTitulo");
  const subtituloEl = document.getElementById("heroSubtitulo");
  const accionesEl = document.getElementById("heroAcciones");

  if (sesion.rol === GymRatData.ROLES.STAFF) {
    tituloEl.textContent = "Hola, " + primerNombre + ". Bienvenido de vuelta.";
    subtituloEl.textContent = "Gestiona ejercicios, rutinas y atletas del gimnasio desde el panel de administración.";
    accionesEl.innerHTML =
      '<a href="admin/index.html" class="btn btn-brand btn-lg"><i class="bi bi-speedometer2"></i> Ir al panel admin</a>' +
      '<a href="mis-rutinas.html" class="btn btn-brand-outline btn-lg">Ver mis rutinas</a>';
    return;
  }

  const rutinasAtleta = GymRatData.getRutinasPorAtleta(sesion.id);

  if (!rutinasAtleta.length) {
    tituloEl.textContent = "Hola, " + primerNombre + ". Vamos a armar tu primera rutina.";
    subtituloEl.textContent = "Elige tus ejercicios por grupo muscular y arma una rutina a tu nivel en un par de minutos.";
    accionesEl.innerHTML =
      '<a href="ejercicios.html" class="btn btn-brand btn-lg"><i class="bi bi-plus-lg"></i> Crear mi primera rutina</a>';
    return;
  }

  const diaHoy = GymRatData.getDiaDeHoy();
  const idRutinaHoy = GymRatData.getHorario(sesion.id)[diaHoy];

  if (idRutinaHoy) {
    const rutina = GymRatData.getRutinaCompleta(idRutinaHoy);
    tituloEl.textContent = "Hola, " + primerNombre + ". Hoy toca " + rutina.nombreRutina + ".";
    subtituloEl.innerHTML =
      badgeDificultad(rutina.dificultad) +
      ' <span class="gr-group-pill ms-1"><i class="bi bi-lightning-charge-fill"></i>' +
      rutina.ejercicios.length +
      " ejercicios</span>";
    accionesEl.innerHTML =
      '<a href="ejecutar-rutina.html?id=' + idRutinaHoy + '" class="btn btn-brand btn-lg"><i class="bi bi-play-fill"></i> Ejecutar rutina de hoy</a>' +
      '<a href="mi-semana.html" class="btn btn-brand-outline btn-lg">Ver mi semana</a>';
    return;
  }

  tituloEl.textContent = "Hola, " + primerNombre + ". No tienes rutina asignada para hoy.";
  subtituloEl.textContent = "Asigna una rutina a cada día de la semana desde Mi semana, o revisa las que ya tienes guardadas.";
  accionesEl.innerHTML =
    '<a href="mi-semana.html" class="btn btn-brand btn-lg"><i class="bi bi-calendar-week"></i> Ver mi semana</a>' +
    '<a href="mis-rutinas.html" class="btn btn-brand-outline btn-lg">Ver mis rutinas</a>';
}

/**
 * Igual que actualizarHeroSesion pero para los enlaces "Iniciar sesion" /
 * "Crear cuenta" del pie de pagina: con sesion activa no tiene sentido
 * seguir invitando a crearla, asi que se reemplazan por accesos utiles.
 */
function actualizarFooterSesion() {
  const sesion = GymRatData.getSesion();
  if (!sesion) return;
  const linkLogin = document.getElementById("footerLinkLogin");
  const linkRegistro = document.getElementById("footerLinkRegistro");
  if (linkLogin) linkLogin.innerHTML = '<a href="perfil.html">Mi perfil</a>';
  if (linkRegistro) linkRegistro.innerHTML = '<a href="mis-rutinas.html">Mis rutinas</a>';
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
        <p class="text-muted small mb-3">${r.dias} días por semana &middot; ${r.ejercicios.length} ejercicios</p>
        ${badgeDificultad(r.dificultad)}
      </div>
    </div>`
    )
    .join("");
}

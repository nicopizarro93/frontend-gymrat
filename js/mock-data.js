/**
 * GymRat - Capa de datos simulada (mock) para Evaluacion 1
 * ------------------------------------------------------------
 * Esta capa reemplaza temporalmente al backend real (microservicios
 * Spring Boot de Proyect-GymRat) mientras este no esta expuesto al
 * frontend (falta seguridad/CORS, JWT, etc.).
 *
 * Los objetos que maneja replican EXACTAMENTE los campos de los DTOs
 * reales del backend, para que en la Evaluacion 3 (integracion) el
 * cambio de estas funciones a fetch() reales sea directo:
 *
 *   Atleta    -> AtletaRequestDTO    { rut, nombre, email, rol }
 *   Ejercicio -> EjercicioRequestDTO { nombreEjercicio, grupoMuscular, dificultad }
 *   Rutina    -> Rutina (POST body)  { nombreRutina, dificultad, dias, ejerciciosIds }
 *
 * Campos marcados como "solo mock" (password, apellidos, fechaNacimiento,
 * region, comuna, direccion) no existen todavia en el backend real: se
 * guardan igual en localStorage para poder cumplir las validaciones que
 * pide el enunciado (Anexo 1), pero quedan documentados como pendientes
 * de que el backend los soporte mas adelante.
 */

(function (global) {
  "use strict";

  const STORAGE_KEYS = {
    ATLETAS: "gymrat_atletas",
    EJERCICIOS: "gymrat_ejercicios",
    RUTINAS: "gymrat_rutinas",
    SESION: "gymrat_session",
    CARRITO: "gymrat_carrito",
    SEED_VERSION: "gymrat_seed_version",
  };

  // Subir este numero fuerza un re-seed en navegadores que ya tengan
  // datos guardados de una version anterior de la semilla.
  const SEED_VERSION = "2";

  const ROLES = { MIEMBRO: "MIEMBRO", STAFF: "STAFF" };
  const GRUPOS_MUSCULARES = ["PECHO", "ESPALDA", "PIERNA", "HOMBRO", "BICEP", "TRICEP", "ABDOMEN"];
  const DIFICULTADES = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"];

  // ---------------------------------------------------------------
  // Utilidades genericas de almacenamiento
  // ---------------------------------------------------------------

  function leer(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("GymRatData: error leyendo " + key, e);
      return null;
    }
  }

  function guardar(key, valor) {
    localStorage.setItem(key, JSON.stringify(valor));
  }

  function siguienteId(lista, campoId) {
    if (!lista.length) return 1;
    return Math.max.apply(null, lista.map((item) => item[campoId])) + 1;
  }

  // ---------------------------------------------------------------
  // Datos semilla
  // ---------------------------------------------------------------

  function semillaEjercicios() {
    return [
      { idEjercicio: 1, nombreEjercicio: "Press banca", grupoMuscular: "PECHO", dificultad: "INTERMEDIO" },
      { idEjercicio: 2, nombreEjercicio: "Press inclinado con mancuernas", grupoMuscular: "PECHO", dificultad: "INTERMEDIO" },
      { idEjercicio: 3, nombreEjercicio: "Flexiones de pecho", grupoMuscular: "PECHO", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 4, nombreEjercicio: "Dominadas", grupoMuscular: "ESPALDA", dificultad: "AVANZADO" },
      { idEjercicio: 5, nombreEjercicio: "Remo con barra", grupoMuscular: "ESPALDA", dificultad: "INTERMEDIO" },
      { idEjercicio: 6, nombreEjercicio: "Jalon al pecho", grupoMuscular: "ESPALDA", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 7, nombreEjercicio: "Sentadilla", grupoMuscular: "PIERNA", dificultad: "INTERMEDIO" },
      { idEjercicio: 8, nombreEjercicio: "Prensa de piernas", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 9, nombreEjercicio: "Zancadas", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 10, nombreEjercicio: "Peso muerto", grupoMuscular: "PIERNA", dificultad: "AVANZADO" },
      { idEjercicio: 11, nombreEjercicio: "Press militar", grupoMuscular: "HOMBRO", dificultad: "INTERMEDIO" },
      { idEjercicio: 12, nombreEjercicio: "Elevaciones laterales", grupoMuscular: "HOMBRO", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 13, nombreEjercicio: "Curl con barra", grupoMuscular: "BICEP", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 14, nombreEjercicio: "Curl martillo", grupoMuscular: "BICEP", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 15, nombreEjercicio: "Press frances", grupoMuscular: "TRICEP", dificultad: "INTERMEDIO" },
      { idEjercicio: 16, nombreEjercicio: "Fondos en banco", grupoMuscular: "TRICEP", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 17, nombreEjercicio: "Plancha abdominal", grupoMuscular: "ABDOMEN", dificultad: "PRINCIPIANTE" },
      { idEjercicio: 18, nombreEjercicio: "Elevacion de piernas", grupoMuscular: "ABDOMEN", dificultad: "INTERMEDIO" },
    ];
  }

  function semillaRutinas() {
    return [
      // atletaId: campo SOLO MOCK. El backend real (Rutina.java) todavia
      // no modela un dueño para la rutina; se agrega aqui para poder
      // mostrar "Mis rutinas" en el perfil del atleta.
      { idRutina: 1, nombreRutina: "Fuerza Tren Superior", dificultad: "INTERMEDIO", dias: 4, ejerciciosIds: [1, 5, 11, 13, 15], atletaId: 2 },
      { idRutina: 2, nombreRutina: "Full Body Principiante", dificultad: "PRINCIPIANTE", dias: 3, ejerciciosIds: [3, 6, 9, 14, 17], atletaId: 3 },
      { idRutina: 3, nombreRutina: "Hipertrofia Avanzada", dificultad: "AVANZADO", dias: 5, ejerciciosIds: [4, 10, 1, 5, 7, 18], atletaId: 2 },
      { idRutina: 4, nombreRutina: "Piernas y Core", dificultad: "INTERMEDIO", dias: 3, ejerciciosIds: [7, 9, 10, 17, 18], atletaId: null },
    ];
  }

  function semillaAtletas() {
    // La contrasena es un campo SOLO MOCK: el DTO real (AtletaRequestDTO)
    // todavia no incluye autenticacion (falta JWT en el backend).
    return [
      { id: 1, rut: "18345678-9", nombre: "Camila Rojas", email: "admin@gymrat.cl", rol: "STAFF", password: "admin123" },
      { id: 2, rut: "19222333-4", nombre: "Matias Fernandez", email: "matias.fernandez@gmail.com", rol: "MIEMBRO", password: "socio123" },
      { id: 3, rut: "20111222-3", nombre: "Valentina Soto", email: "valentina.soto@gmail.com", rol: "MIEMBRO", password: "socio123" },
    ];
  }

  // ---------------------------------------------------------------
  // Inicializacion / semilla
  // ---------------------------------------------------------------

  function init() {
    const versionGuardada = localStorage.getItem(STORAGE_KEYS.SEED_VERSION);
    if (versionGuardada !== SEED_VERSION) {
      guardar(STORAGE_KEYS.EJERCICIOS, semillaEjercicios());
      guardar(STORAGE_KEYS.RUTINAS, semillaRutinas());
      guardar(STORAGE_KEYS.ATLETAS, semillaAtletas());
      guardar(STORAGE_KEYS.CARRITO, []);
      localStorage.setItem(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
      return;
    }
    if (!leer(STORAGE_KEYS.EJERCICIOS)) guardar(STORAGE_KEYS.EJERCICIOS, semillaEjercicios());
    if (!leer(STORAGE_KEYS.RUTINAS)) guardar(STORAGE_KEYS.RUTINAS, semillaRutinas());
    if (!leer(STORAGE_KEYS.ATLETAS)) guardar(STORAGE_KEYS.ATLETAS, semillaAtletas());
    if (!leer(STORAGE_KEYS.CARRITO)) guardar(STORAGE_KEYS.CARRITO, []);
  }

  // ---------------------------------------------------------------
  // Ejercicios
  // ---------------------------------------------------------------

  function getEjercicios() {
    return leer(STORAGE_KEYS.EJERCICIOS) || [];
  }

  function getEjercicioPorId(id) {
    return getEjercicios().find((e) => e.idEjercicio === Number(id)) || null;
  }

  function filtrarEjercicios(filtro) {
    filtro = filtro || {};
    return getEjercicios().filter((e) => {
      if (filtro.grupoMuscular && e.grupoMuscular !== filtro.grupoMuscular) return false;
      if (filtro.dificultad && e.dificultad !== filtro.dificultad) return false;
      if (filtro.texto && !e.nombreEjercicio.toLowerCase().includes(filtro.texto.toLowerCase())) return false;
      return true;
    });
  }

  function crearEjercicio(dto) {
    const lista = getEjercicios();
    const nuevo = {
      idEjercicio: siguienteId(lista, "idEjercicio"),
      nombreEjercicio: dto.nombreEjercicio,
      grupoMuscular: dto.grupoMuscular,
      dificultad: dto.dificultad,
    };
    lista.push(nuevo);
    guardar(STORAGE_KEYS.EJERCICIOS, lista);
    return nuevo;
  }

  function actualizarEjercicio(id, dto) {
    const lista = getEjercicios();
    const idx = lista.findIndex((e) => e.idEjercicio === Number(id));
    if (idx === -1) return null;
    lista[idx] = Object.assign({}, lista[idx], dto, { idEjercicio: lista[idx].idEjercicio });
    guardar(STORAGE_KEYS.EJERCICIOS, lista);
    return lista[idx];
  }

  function eliminarEjercicio(id) {
    const idNum = Number(id);
    const lista = getEjercicios().filter((e) => e.idEjercicio !== idNum);
    guardar(STORAGE_KEYS.EJERCICIOS, lista);
    // Tambien lo saca de rutinas y del carrito para no dejar referencias colgando.
    const rutinas = getRutinas().map((r) => Object.assign({}, r, {
      ejerciciosIds: r.ejerciciosIds.filter((eid) => eid !== idNum),
    }));
    guardar(STORAGE_KEYS.RUTINAS, rutinas);
    guardar(STORAGE_KEYS.CARRITO, getCarrito().filter((eid) => eid !== idNum));
  }

  // ---------------------------------------------------------------
  // Rutinas
  // ---------------------------------------------------------------

  function getRutinas() {
    return leer(STORAGE_KEYS.RUTINAS) || [];
  }

  function getRutinaPorId(id) {
    return getRutinas().find((r) => r.idRutina === Number(id)) || null;
  }

  // Equivalente al endpoint GET /rutinas/{id}/completa del backend real:
  // devuelve la rutina con sus ejercicios ya resueltos (RutinaResponseDTO).
  function getRutinaCompleta(id) {
    const rutina = getRutinaPorId(id);
    if (!rutina) return null;
    const ejercicios = rutina.ejerciciosIds.map((eid) => getEjercicioPorId(eid)).filter(Boolean);
    return {
      idRutina: rutina.idRutina,
      nombreRutina: rutina.nombreRutina,
      dificultad: rutina.dificultad,
      dias: rutina.dias,
      ejercicios: ejercicios,
    };
  }

  // extras: campos que hoy solo existen en el frontend (atletaId) porque
  // el backend real (Rutina.java) todavia no modela un dueño de la rutina.
  function getRutinasPorAtleta(atletaId) {
    return getRutinas().filter((r) => r.atletaId === Number(atletaId));
  }

  function crearRutina(dto, extras) {
    const lista = getRutinas();
    const nueva = Object.assign(
      {
        idRutina: siguienteId(lista, "idRutina"),
        nombreRutina: dto.nombreRutina,
        dificultad: dto.dificultad,
        dias: Number(dto.dias),
        ejerciciosIds: (dto.ejerciciosIds || []).map(Number),
      },
      extras || {}
    );
    lista.push(nueva);
    guardar(STORAGE_KEYS.RUTINAS, lista);
    return nueva;
  }

  function actualizarRutina(id, dto) {
    const lista = getRutinas();
    const idx = lista.findIndex((r) => r.idRutina === Number(id));
    if (idx === -1) return null;
    lista[idx] = Object.assign({}, lista[idx], dto, { idRutina: lista[idx].idRutina });
    guardar(STORAGE_KEYS.RUTINAS, lista);
    return lista[idx];
  }

  function eliminarRutina(id) {
    const lista = getRutinas().filter((r) => r.idRutina !== Number(id));
    guardar(STORAGE_KEYS.RUTINAS, lista);
  }

  // ---------------------------------------------------------------
  // Atletas (usuarios)
  // ---------------------------------------------------------------

  function getAtletas() {
    return leer(STORAGE_KEYS.ATLETAS) || [];
  }

  function getAtletaPorId(id) {
    return getAtletas().find((a) => a.id === Number(id)) || null;
  }

  function buscarPorRut(rut) {
    return getAtletas().find((a) => a.rut === rut) || null;
  }

  function buscarPorEmail(email) {
    return getAtletas().find((a) => a.email.toLowerCase() === String(email).toLowerCase()) || null;
  }

  // dto: { rut, nombre, email, rol } -> igual al AtletaRequestDTO real.
  // extras: campos que hoy solo existen en el frontend (password,
  // apellidos, fechaNacimiento, region, comuna, direccion) porque el
  // backend real todavia no los soporta.
  function crearAtleta(dto, extras) {
    const lista = getAtletas();
    const nuevo = Object.assign(
      {
        id: siguienteId(lista, "id"),
        rut: dto.rut,
        nombre: dto.nombre,
        email: dto.email,
        rol: dto.rol || ROLES.MIEMBRO,
      },
      extras || {}
    );
    lista.push(nuevo);
    guardar(STORAGE_KEYS.ATLETAS, lista);
    return nuevo;
  }

  function actualizarAtleta(id, dto) {
    const lista = getAtletas();
    const idx = lista.findIndex((a) => a.id === Number(id));
    if (idx === -1) return null;
    lista[idx] = Object.assign({}, lista[idx], dto, { id: lista[idx].id });
    guardar(STORAGE_KEYS.ATLETAS, lista);
    return lista[idx];
  }

  function eliminarAtleta(id) {
    const lista = getAtletas().filter((a) => a.id !== Number(id));
    guardar(STORAGE_KEYS.ATLETAS, lista);
  }

  // ---------------------------------------------------------------
  // Sesion (mock de autenticacion - reemplazar por JWT real en Eval. 3)
  // ---------------------------------------------------------------

  function login(identificador, password) {
    const atleta = buscarPorEmail(identificador) || buscarPorRut(identificador);
    if (!atleta || atleta.password !== password) return null;
    const sesionPublica = Object.assign({}, atleta);
    delete sesionPublica.password;
    guardar(STORAGE_KEYS.SESION, sesionPublica);
    return sesionPublica;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESION);
  }

  function getSesion() {
    return leer(STORAGE_KEYS.SESION);
  }

  function esStaff() {
    const s = getSesion();
    return !!s && s.rol === ROLES.STAFF;
  }

  // Protege una pagina: si no hay sesion (o si se exige staff y no lo es),
  // redirige a login/inicio. Pensada para llamarse al principio del <script>
  // de paginas privadas (admin, etc.).
  function exigirSesion(opciones) {
    opciones = opciones || {};
    const soloStaff = !!opciones.soloStaff;
    const redirigirA = opciones.redirigirA || "login.html";
    const s = getSesion();
    if (!s || (soloStaff && s.rol !== ROLES.STAFF)) {
      window.location.href = redirigirA;
      return null;
    }
    return s;
  }

  // ---------------------------------------------------------------
  // Carrito de ejercicios (para armar una rutina antes de guardarla)
  // ---------------------------------------------------------------

  function getCarrito() {
    return leer(STORAGE_KEYS.CARRITO) || [];
  }

  function agregarAlCarrito(idEjercicio) {
    const carrito = getCarrito();
    const id = Number(idEjercicio);
    if (!carrito.includes(id)) carrito.push(id);
    guardar(STORAGE_KEYS.CARRITO, carrito);
    return carrito;
  }

  function quitarDelCarrito(idEjercicio) {
    const carrito = getCarrito().filter((id) => id !== Number(idEjercicio));
    guardar(STORAGE_KEYS.CARRITO, carrito);
    return carrito;
  }

  function vaciarCarrito() {
    guardar(STORAGE_KEYS.CARRITO, []);
  }

  // ---------------------------------------------------------------
  // API publica
  // ---------------------------------------------------------------

  global.GymRatData = {
    ROLES: ROLES,
    GRUPOS_MUSCULARES: GRUPOS_MUSCULARES,
    DIFICULTADES: DIFICULTADES,
    init: init,
    // ejercicios
    getEjercicios: getEjercicios,
    getEjercicioPorId: getEjercicioPorId,
    filtrarEjercicios: filtrarEjercicios,
    crearEjercicio: crearEjercicio,
    actualizarEjercicio: actualizarEjercicio,
    eliminarEjercicio: eliminarEjercicio,
    // rutinas
    getRutinas: getRutinas,
    getRutinaPorId: getRutinaPorId,
    getRutinaCompleta: getRutinaCompleta,
    getRutinasPorAtleta: getRutinasPorAtleta,
    crearRutina: crearRutina,
    actualizarRutina: actualizarRutina,
    eliminarRutina: eliminarRutina,
    // atletas
    getAtletas: getAtletas,
    getAtletaPorId: getAtletaPorId,
    buscarPorRut: buscarPorRut,
    buscarPorEmail: buscarPorEmail,
    crearAtleta: crearAtleta,
    actualizarAtleta: actualizarAtleta,
    eliminarAtleta: eliminarAtleta,
    // sesion
    login: login,
    logout: logout,
    getSesion: getSesion,
    esStaff: esStaff,
    exigirSesion: exigirSesion,
    // carrito
    getCarrito: getCarrito,
    agregarAlCarrito: agregarAlCarrito,
    quitarDelCarrito: quitarDelCarrito,
    vaciarCarrito: vaciarCarrito,
  };

  // Auto-inicializar la semilla en cuanto se carga el script.
  init();
})(window);

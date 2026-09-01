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
 * region, comuna, direccion, atletaId, series/repeticiones/descansoSegundos
 * por ejercicio, y toda la ejecucion de entrenamiento) no existen todavia
 * en el backend real: se guardan igual en localStorage para poder cumplir
 * lo que pide esta evaluacion, documentados como pendientes de que el
 * backend los soporte mas adelante (ver README.md).
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
    EJECUCION_PREFIJO: "gymrat_ejecucion_",
    HORARIO: "gymrat_horario",
  };

  // Dias de la semana para "Mi semana" - concepto SOLO MOCK, el backend
  // real no tiene ningun modelo de calendario/horario de entrenamiento.
  const DIAS_SEMANA = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

  // Subir este numero fuerza un re-seed en navegadores que ya tengan
  // datos guardados de una version anterior de la semilla.
  const SEED_VERSION = "5";

  const ROLES = { MIEMBRO: "MIEMBRO", STAFF: "STAFF" };
  const GRUPOS_MUSCULARES = ["PECHO", "ESPALDA", "PIERNA", "HOMBRO", "BICEP", "TRICEP", "ABDOMEN"];
  const DIFICULTADES = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"];

  // Valores por defecto al agregar un ejercicio a una rutina en construccion.
  const DEFAULT_SERIES = 3;
  const DEFAULT_REPETICIONES = 10;
  const DEFAULT_DESCANSO_SEGUNDOS = 60;

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

  // gifUrl: campo SOLO MOCK, extension no soportada por el backend real
  // (Ejercicio.java solo tiene idEjercicio/nombreEjercicio/grupoMuscular/
  // dificultad, sin ningun campo de imagen o media). Ruta relativa a un
  // gif dentro de frontend/gif/<grupo>/, o null si todavia no hay imagen
  // para ese ejercicio. Por ahora solo estan cargados los de PECHO y
  // ESPALDA (14 de 44) - el resto queda en null hasta conseguir el resto
  // del material.
  function semillaEjercicios() {
    return [
      { idEjercicio: 1, nombreEjercicio: "Press banca", grupoMuscular: "PECHO", dificultad: "INTERMEDIO", gifUrl: "gif/pecho/1-press-banca.gif" },
      { idEjercicio: 2, nombreEjercicio: "Press inclinado con mancuernas", grupoMuscular: "PECHO", dificultad: "INTERMEDIO", gifUrl: "gif/pecho/2-press-inclinado-mancuernas.gif" },
      { idEjercicio: 3, nombreEjercicio: "Flexiones de pecho", grupoMuscular: "PECHO", dificultad: "PRINCIPIANTE", gifUrl: "gif/pecho/3-flexiones-pecho.gif" },
      { idEjercicio: 4, nombreEjercicio: "Dominadas", grupoMuscular: "ESPALDA", dificultad: "AVANZADO", gifUrl: "gif/espalda/4-dominadas.gif" },
      { idEjercicio: 5, nombreEjercicio: "Remo con barra", grupoMuscular: "ESPALDA", dificultad: "INTERMEDIO", gifUrl: "gif/espalda/5-remo-con-barra.gif" },
      { idEjercicio: 6, nombreEjercicio: "Jalon al pecho", grupoMuscular: "ESPALDA", dificultad: "PRINCIPIANTE", gifUrl: "gif/espalda/6-jalon-al-pecho.jpg" },
      { idEjercicio: 7, nombreEjercicio: "Sentadilla", grupoMuscular: "PIERNA", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 8, nombreEjercicio: "Prensa de piernas", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 9, nombreEjercicio: "Zancadas", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 10, nombreEjercicio: "Peso muerto", grupoMuscular: "PIERNA", dificultad: "AVANZADO", gifUrl: null },
      { idEjercicio: 11, nombreEjercicio: "Press militar", grupoMuscular: "HOMBRO", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 12, nombreEjercicio: "Elevaciones laterales", grupoMuscular: "HOMBRO", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 13, nombreEjercicio: "Curl con barra", grupoMuscular: "BICEP", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 14, nombreEjercicio: "Curl martillo", grupoMuscular: "BICEP", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 15, nombreEjercicio: "Press frances", grupoMuscular: "TRICEP", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 16, nombreEjercicio: "Fondos en banco", grupoMuscular: "TRICEP", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 17, nombreEjercicio: "Plancha abdominal", grupoMuscular: "ABDOMEN", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 18, nombreEjercicio: "Elevacion de piernas", grupoMuscular: "ABDOMEN", dificultad: "INTERMEDIO", gifUrl: null },
      // Ampliacion del catalogo (pedido del usuario): los ejercicios mas
      // usados de cada grupo muscular, para no quedarse solo con 2-4 por
      // categoria.
      { idEjercicio: 19, nombreEjercicio: "Press inclinado con barra", grupoMuscular: "PECHO", dificultad: "INTERMEDIO", gifUrl: "gif/pecho/19-press-inclinado-barra.gif" },
      { idEjercicio: 20, nombreEjercicio: "Aperturas con mancuernas", grupoMuscular: "PECHO", dificultad: "PRINCIPIANTE", gifUrl: "gif/pecho/20-aperturas-mancuernas.gif" },
      { idEjercicio: 21, nombreEjercicio: "Fondos en paralelas", grupoMuscular: "PECHO", dificultad: "AVANZADO", gifUrl: "gif/pecho/21-fondos-paralelas.gif" },
      { idEjercicio: 22, nombreEjercicio: "Cruce de poleas", grupoMuscular: "PECHO", dificultad: "INTERMEDIO", gifUrl: "gif/pecho/22-cruce-poleas.gif" },
      { idEjercicio: 23, nombreEjercicio: "Remo con mancuerna a un brazo", grupoMuscular: "ESPALDA", dificultad: "INTERMEDIO", gifUrl: "gif/espalda/23-remo-mancuerna-un-brazo.gif" },
      { idEjercicio: 24, nombreEjercicio: "Remo sentado en polea baja", grupoMuscular: "ESPALDA", dificultad: "PRINCIPIANTE", gifUrl: "gif/espalda/24-remo-sentado-polea-baja.gif" },
      { idEjercicio: 25, nombreEjercicio: "Pull-over con mancuerna", grupoMuscular: "ESPALDA", dificultad: "INTERMEDIO", gifUrl: "gif/espalda/25-pull-over-mancuerna.gif" },
      { idEjercicio: 26, nombreEjercicio: "Hiperextensiones lumbares", grupoMuscular: "ESPALDA", dificultad: "PRINCIPIANTE", gifUrl: "gif/espalda/26-hiperextensiones-lumbares.gif" },
      { idEjercicio: 27, nombreEjercicio: "Extension de cuadriceps", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 28, nombreEjercicio: "Curl femoral", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 29, nombreEjercicio: "Elevacion de talones", grupoMuscular: "PIERNA", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 30, nombreEjercicio: "Hip thrust", grupoMuscular: "PIERNA", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 31, nombreEjercicio: "Sentadilla bulgara", grupoMuscular: "PIERNA", dificultad: "AVANZADO", gifUrl: null },
      { idEjercicio: 32, nombreEjercicio: "Elevaciones frontales", grupoMuscular: "HOMBRO", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 33, nombreEjercicio: "Pajaros (deltoide posterior)", grupoMuscular: "HOMBRO", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 34, nombreEjercicio: "Press Arnold", grupoMuscular: "HOMBRO", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 35, nombreEjercicio: "Encogimientos de hombros", grupoMuscular: "HOMBRO", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 36, nombreEjercicio: "Curl con mancuernas alterno", grupoMuscular: "BICEP", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 37, nombreEjercicio: "Curl en banco Scott", grupoMuscular: "BICEP", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 38, nombreEjercicio: "Curl concentrado", grupoMuscular: "BICEP", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 39, nombreEjercicio: "Extension de triceps en polea", grupoMuscular: "TRICEP", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 40, nombreEjercicio: "Press cerrado (agarre estrecho)", grupoMuscular: "TRICEP", dificultad: "INTERMEDIO", gifUrl: null },
      { idEjercicio: 41, nombreEjercicio: "Patada de triceps", grupoMuscular: "TRICEP", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 42, nombreEjercicio: "Crunch abdominal", grupoMuscular: "ABDOMEN", dificultad: "PRINCIPIANTE", gifUrl: null },
      { idEjercicio: 43, nombreEjercicio: "Rueda abdominal", grupoMuscular: "ABDOMEN", dificultad: "AVANZADO", gifUrl: null },
      { idEjercicio: 44, nombreEjercicio: "Giro ruso (Russian twist)", grupoMuscular: "ABDOMEN", dificultad: "INTERMEDIO", gifUrl: null },
    ];
  }

  function semillaRutinas() {
    // atletaId y el detalle de cada ejercicio (series/repeticiones/
    // descansoSegundos) son campos SOLO MOCK: el backend real (Rutina.java)
    // todavia no modela dueño de una rutina ni una prescripcion de
    // entrenamiento (solo guarda una lista plana de IDs de ejercicio).
    return [
      {
        idRutina: 1,
        nombreRutina: "Fuerza Tren Superior",
        dificultad: "INTERMEDIO",
        dias: 4,
        atletaId: 2,
        ejercicios: [
          { idEjercicio: 1, series: 4, repeticiones: 8, descansoSegundos: 90 },
          { idEjercicio: 5, series: 3, repeticiones: 10, descansoSegundos: 75 },
          { idEjercicio: 11, series: 3, repeticiones: 10, descansoSegundos: 60 },
          { idEjercicio: 13, series: 3, repeticiones: 12, descansoSegundos: 45 },
          { idEjercicio: 15, series: 3, repeticiones: 12, descansoSegundos: 45 },
        ],
      },
      {
        idRutina: 2,
        nombreRutina: "Full Body Principiante",
        dificultad: "PRINCIPIANTE",
        dias: 3,
        atletaId: 3,
        ejercicios: [
          { idEjercicio: 3, series: 3, repeticiones: 12, descansoSegundos: 45 },
          { idEjercicio: 6, series: 3, repeticiones: 10, descansoSegundos: 45 },
          { idEjercicio: 9, series: 3, repeticiones: 12, descansoSegundos: 45 },
          { idEjercicio: 14, series: 3, repeticiones: 12, descansoSegundos: 30 },
          { idEjercicio: 17, series: 3, repeticiones: 20, descansoSegundos: 30 },
        ],
      },
      {
        idRutina: 3,
        nombreRutina: "Hipertrofia Avanzada",
        dificultad: "AVANZADO",
        dias: 5,
        atletaId: 2,
        ejercicios: [
          { idEjercicio: 4, series: 4, repeticiones: 6, descansoSegundos: 120 },
          { idEjercicio: 10, series: 4, repeticiones: 6, descansoSegundos: 120 },
          { idEjercicio: 1, series: 4, repeticiones: 8, descansoSegundos: 90 },
          { idEjercicio: 5, series: 3, repeticiones: 10, descansoSegundos: 75 },
          { idEjercicio: 7, series: 4, repeticiones: 8, descansoSegundos: 90 },
          { idEjercicio: 18, series: 3, repeticiones: 15, descansoSegundos: 30 },
        ],
      },
      {
        idRutina: 4,
        nombreRutina: "Piernas y Core",
        dificultad: "INTERMEDIO",
        dias: 3,
        atletaId: null,
        ejercicios: [
          { idEjercicio: 7, series: 4, repeticiones: 10, descansoSegundos: 75 },
          { idEjercicio: 9, series: 3, repeticiones: 12, descansoSegundos: 45 },
          { idEjercicio: 10, series: 3, repeticiones: 8, descansoSegundos: 90 },
          { idEjercicio: 17, series: 3, repeticiones: 30, descansoSegundos: 30 },
          { idEjercicio: 18, series: 3, repeticiones: 15, descansoSegundos: 30 },
        ],
      },
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
      guardar(STORAGE_KEYS.HORARIO, {});
      localStorage.setItem(STORAGE_KEYS.SEED_VERSION, SEED_VERSION);
      return;
    }
    if (!leer(STORAGE_KEYS.EJERCICIOS)) guardar(STORAGE_KEYS.EJERCICIOS, semillaEjercicios());
    if (!leer(STORAGE_KEYS.RUTINAS)) guardar(STORAGE_KEYS.RUTINAS, semillaRutinas());
    if (!leer(STORAGE_KEYS.ATLETAS)) guardar(STORAGE_KEYS.ATLETAS, semillaAtletas());
    if (!leer(STORAGE_KEYS.CARRITO)) guardar(STORAGE_KEYS.CARRITO, []);
    if (!leer(STORAGE_KEYS.HORARIO)) guardar(STORAGE_KEYS.HORARIO, {});
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
      ejercicios: r.ejercicios.filter((item) => item.idEjercicio !== idNum),
    }));
    guardar(STORAGE_KEYS.RUTINAS, rutinas);
    guardar(STORAGE_KEYS.CARRITO, getCarrito().filter((item) => item.idEjercicio !== idNum));
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

  // Equivalente (ampliado) al endpoint GET /rutinas/{id}/completa del
  // backend real: devuelve la rutina con sus ejercicios ya resueltos,
  // incluyendo series/repeticiones/descanso (solo mock, ver cabecera).
  function getRutinaCompleta(id) {
    const rutina = getRutinaPorId(id);
    if (!rutina) return null;
    const ejercicios = rutina.ejercicios
      .map((item) => {
        const ejercicio = getEjercicioPorId(item.idEjercicio);
        if (!ejercicio) return null;
        return Object.assign({}, ejercicio, {
          series: item.series,
          repeticiones: item.repeticiones,
          descansoSegundos: item.descansoSegundos,
        });
      })
      .filter(Boolean);
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

  // dto.ejercicios: [{ idEjercicio, series, repeticiones, descansoSegundos }]
  function crearRutina(dto, extras) {
    const lista = getRutinas();
    const nueva = Object.assign(
      {
        idRutina: siguienteId(lista, "idRutina"),
        nombreRutina: dto.nombreRutina,
        dificultad: dto.dificultad,
        dias: Number(dto.dias),
        ejercicios: (dto.ejercicios || []).map((item) => ({
          idEjercicio: Number(item.idEjercicio),
          series: Number(item.series) || DEFAULT_SERIES,
          repeticiones: Number(item.repeticiones) || DEFAULT_REPETICIONES,
          descansoSegundos: Number(item.descansoSegundos) || 0,
        })),
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
    limpiarEjecucion(id);
    limpiarAsignacionesDeRutina(id);
  }

  // ---------------------------------------------------------------
  // Ejecucion de una rutina (entrenamiento en curso) - SOLO MOCK.
  // El backend real no tiene ningun concepto de "ejecutar" una rutina
  // todavia; esto vive por completo en localStorage del navegador.
  //
  // Forma del estado guardado:
  // {
  //   progreso: { "<idEjercicio>": { serieActual: 0, completado: false } },
  //   descansoActivo: null | { idEjercicio, descansoHasta: <epoch ms> },
  // }
  // ---------------------------------------------------------------

  function claveEjecucion(idRutina) {
    return STORAGE_KEYS.EJECUCION_PREFIJO + idRutina;
  }

  function iniciarEjecucion(idRutina) {
    const rutina = getRutinaCompleta(idRutina);
    if (!rutina) return null;
    const progreso = {};
    rutina.ejercicios.forEach((e) => {
      progreso[e.idEjercicio] = { serieActual: 0, completado: false };
    });
    const estado = { progreso: progreso, descansoActivo: null };
    guardar(claveEjecucion(idRutina), estado);
    return estado;
  }

  // Devuelve el estado guardado, o crea uno nuevo si no existe todavia
  // o si la rutina cambio de ejercicios desde la ultima ejecucion.
  function getEjecucion(idRutina) {
    const rutina = getRutinaCompleta(idRutina);
    if (!rutina) return null;
    let estado = leer(claveEjecucion(idRutina));
    const idsVigentes = rutina.ejercicios.map((e) => String(e.idEjercicio));
    const necesitaInicializar =
      !estado || idsVigentes.some((id) => !(id in estado.progreso));
    if (necesitaInicializar) {
      estado = iniciarEjecucion(idRutina);
    }
    return estado;
  }

  function guardarEjecucion(idRutina, estado) {
    guardar(claveEjecucion(idRutina), estado);
  }

  function limpiarEjecucion(idRutina) {
    localStorage.removeItem(claveEjecucion(idRutina));
  }

  // ---------------------------------------------------------------
  // Mi semana: rutina asignada a cada dia (LUNES..DOMINGO) - SOLO MOCK.
  // El backend real no tiene ningun concepto de calendario/horario de
  // entrenamiento; esto vive por completo en localStorage, guardado por
  // atleta: { "<atletaId>": { LUNES: idRutina|null, ... DOMINGO: ... } }
  // ---------------------------------------------------------------

  function horarioVacio() {
    const dias = {};
    DIAS_SEMANA.forEach((d) => {
      dias[d] = null;
    });
    return dias;
  }

  function getHorarioCompleto() {
    return leer(STORAGE_KEYS.HORARIO) || {};
  }

  // Devuelve el horario del atleta, reparando (poniendo en null) los
  // dias que apunten a una rutina que ya no existe o que ya no es suya.
  function getHorario(atletaId) {
    const todos = getHorarioCompleto();
    const idNum = Number(atletaId);
    const guardado = todos[idNum];
    const dias = guardado ? Object.assign({}, horarioVacio(), guardado) : horarioVacio();
    const misRutinasIds = getRutinasPorAtleta(idNum).map((r) => r.idRutina);
    let cambio = !guardado;
    DIAS_SEMANA.forEach((d) => {
      if (dias[d] !== null && misRutinasIds.indexOf(dias[d]) === -1) {
        dias[d] = null;
        cambio = true;
      }
    });
    if (cambio) {
      todos[idNum] = dias;
      guardar(STORAGE_KEYS.HORARIO, todos);
    }
    return dias;
  }

  function asignarRutinaDia(atletaId, dia, idRutina) {
    const todos = getHorarioCompleto();
    const idNum = Number(atletaId);
    const dias = todos[idNum] ? Object.assign({}, horarioVacio(), todos[idNum]) : horarioVacio();
    dias[dia] = idRutina ? Number(idRutina) : null;
    todos[idNum] = dias;
    guardar(STORAGE_KEYS.HORARIO, todos);
    return dias;
  }

  // Se llama al eliminar una rutina para no dejar dias de ningun atleta
  // apuntando a un idRutina que ya no existe.
  function limpiarAsignacionesDeRutina(idRutina) {
    const todos = getHorarioCompleto();
    const idNum = Number(idRutina);
    let cambio = false;
    Object.keys(todos).forEach((atletaId) => {
      DIAS_SEMANA.forEach((d) => {
        if (todos[atletaId][d] === idNum) {
          todos[atletaId][d] = null;
          cambio = true;
        }
      });
    });
    if (cambio) guardar(STORAGE_KEYS.HORARIO, todos);
  }

  // Mapea el dia real de hoy (segun el reloj del navegador) a una clave
  // de DIAS_SEMANA. Date.getDay(): 0=domingo..6=sabado.
  function getDiaDeHoy() {
    const mapa = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    return mapa[new Date().getDay()];
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
  // Cada item ya guarda la prescripcion (series/repeticiones/descanso)
  // que tendra ese ejercicio dentro de la rutina.
  // ---------------------------------------------------------------

  function getCarrito() {
    return leer(STORAGE_KEYS.CARRITO) || [];
  }

  function agregarAlCarrito(idEjercicio) {
    const carrito = getCarrito();
    const id = Number(idEjercicio);
    if (!carrito.some((item) => item.idEjercicio === id)) {
      carrito.push({
        idEjercicio: id,
        series: DEFAULT_SERIES,
        repeticiones: DEFAULT_REPETICIONES,
        descansoSegundos: DEFAULT_DESCANSO_SEGUNDOS,
      });
    }
    guardar(STORAGE_KEYS.CARRITO, carrito);
    return carrito;
  }

  function actualizarItemCarrito(idEjercicio, cambios) {
    const carrito = getCarrito();
    const idx = carrito.findIndex((item) => item.idEjercicio === Number(idEjercicio));
    if (idx === -1) return null;
    carrito[idx] = Object.assign({}, carrito[idx], cambios);
    guardar(STORAGE_KEYS.CARRITO, carrito);
    return carrito[idx];
  }

  function quitarDelCarrito(idEjercicio) {
    const id = Number(idEjercicio);
    const carrito = getCarrito().filter((item) => item.idEjercicio !== id);
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
    // ejecucion de rutina
    getEjecucion: getEjecucion,
    guardarEjecucion: guardarEjecucion,
    limpiarEjecucion: limpiarEjecucion,
    // mi semana (horario)
    DIAS_SEMANA: DIAS_SEMANA,
    getHorario: getHorario,
    asignarRutinaDia: asignarRutinaDia,
    getDiaDeHoy: getDiaDeHoy,
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
    actualizarItemCarrito: actualizarItemCarrito,
    quitarDelCarrito: quitarDelCarrito,
    vaciarCarrito: vaciarCarrito,
  };

  // Auto-inicializar la semilla en cuanto se carga el script.
  init();
})(window);

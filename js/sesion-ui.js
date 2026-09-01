/**
 * GymRat - Sincroniza la barra de navegacion con la sesion mock actual.
 * Se incluye en TODAS las paginas publicas, despues de mock-data.js.
 *
 * Cada pagina debe tener en su navbar un contenedor:
 *   <div id="navAuthArea"> ... botones de Iniciar sesion / Registro ... </div>
 * Este script lo reemplaza por un menu de cuenta (dropdown de Bootstrap)
 * si ya hay una sesion mock activa (ver GymRatData.login en mock-data.js).
 *
 * prefijo: usar "" en paginas de la raiz de frontend/ y "../" dentro de
 * frontend/admin/, para que los enlaces generados apunten al lugar correcto.
 */
(function (global) {
  "use strict";

  function iniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    const primera = partes[0] ? partes[0][0] : "";
    const segunda = partes[1] ? partes[1][0] : "";
    return (primera + segunda).toUpperCase();
  }

  function actualizarNavSesion(prefijo) {
    prefijo = prefijo || "";
    const contenedor = document.getElementById("navAuthArea");
    if (!contenedor || !global.GymRatData) return;

    const sesion = GymRatData.getSesion();
    if (!sesion) return; // se deja el markup por defecto (Iniciar sesion / Unete)

    const primerNombre = sesion.nombre.split(" ")[0];
    const enlaceAdmin =
      sesion.rol === GymRatData.ROLES.STAFF
        ? '<li><a class="dropdown-item" href="' + prefijo + 'admin/index.html"><i class="bi bi-speedometer2 me-2"></i>Panel admin</a></li>'
        : "";

    contenedor.innerHTML =
      '<div class="dropdown">' +
      '<button class="btn btn-brand-outline btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
      '<span class="gr-avatar-circle">' + iniciales(sesion.nombre) + "</span>" +
      '<span class="d-none d-lg-inline">' + primerNombre + "</span>" +
      "</button>" +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><a class="dropdown-item" href="' + prefijo + 'perfil.html"><i class="bi bi-person me-2"></i>Mi perfil</a></li>' +
      enlaceAdmin +
      '<li><hr class="dropdown-divider"></li>' +
      '<li><button type="button" class="dropdown-item" id="btnCerrarSesion"><i class="bi bi-power me-2"></i>Cerrar sesión</button></li>' +
      "</ul>" +
      "</div>";

    const btnSalir = document.getElementById("btnCerrarSesion");
    if (btnSalir) {
      btnSalir.addEventListener("click", function () {
        GymRatData.logout();
        window.location.href = prefijo + "index.html";
      });
    }
  }

  global.actualizarNavSesion = actualizarNavSesion;
})(window);

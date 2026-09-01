/**
 * GymRat - Logica de la pagina de login (login.html).
 * Acepta correo o RUT como identificador (Anexo 1 pide ambos casos de uso).
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const alerta = document.getElementById("alertaLogin");

  const reglas = {
    identificador: (valor) => Validaciones.requerido(valor, "El correo o RUT"),
    password: (valor) => Validaciones.requerido(valor, "La contraseña"),
  };

  Validaciones.validarFormulario(form, reglas, (datos) => {
    alerta.classList.add("d-none");

    const sesion = GymRatData.login(datos.get("identificador").trim(), datos.get("password"));

    if (!sesion) {
      alerta.textContent = "Correo/RUT o contraseña incorrectos.";
      alerta.classList.remove("d-none");
      return;
    }

    window.location.href = sesion.rol === GymRatData.ROLES.STAFF ? "admin/index.html" : "index.html";
  });
});

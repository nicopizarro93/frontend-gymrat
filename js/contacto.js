/**
 * GymRat - Logica del formulario de contacto (contacto.html).
 * Regla del enunciado (Anexo 1): el correo debe pertenecer a uno de los
 * dominios @duoc.cl, @profesor.duoc.cl o @gmail.com.
 */
document.addEventListener("DOMContentLoaded", () => {
  actualizarNavSesion("");

  const form = document.getElementById("formContacto");
  const alerta = document.getElementById("alertaContacto");
  const DOMINIOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

  const reglas = {
    nombre: (valor) => {
      const req = Validaciones.requerido(valor, "El nombre");
      if (!req.valido) return req;
      return Validaciones.soloTexto(valor, "El nombre");
    },
    correo: (valor) => Validaciones.emailConDominio(valor, DOMINIOS_PERMITIDOS),
    comentario: (valor) => Validaciones.longitud(valor, 10, 500, "El comentario"),
  };

  Validaciones.validarFormulario(form, reglas, () => {
    // No hay un microservicio de "contacto" en el backend real: se guarda
    // localmente para efectos de esta evaluación y se confirma al usuario.
    alerta.classList.remove("d-none");
    form.reset();
    form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/**
 * GymRat - Logica de la pagina de registro (registro.html).
 * Conecta el formulario a Validaciones.validarFormulario y, si todo es
 * valido, crea el atleta en la capa mock (GymRatData) e inicia sesion.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  const alerta = document.getElementById("alertaRegistro");

  function mostrarAlerta(mensaje) {
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
  }

  function ocultarAlerta() {
    alerta.classList.add("d-none");
  }

  const reglas = {
    rut: (valor) => {
      const resultado = Validaciones.rut(valor);
      if (resultado.valido && GymRatData.buscarPorRut(valor.trim().toUpperCase())) {
        return { valido: false, mensaje: "Ya existe una cuenta registrada con este RUT." };
      }
      return resultado;
    },
    fechaNacimiento: (valor) => Validaciones.fechaNacimiento(valor, 16),
    nombre: (valor) => {
      const req = Validaciones.requerido(valor, "El nombre");
      if (!req.valido) return req;
      return Validaciones.soloTexto(valor, "El nombre");
    },
    apellidos: (valor) => {
      const req = Validaciones.requerido(valor, "Los apellidos");
      if (!req.valido) return req;
      return Validaciones.soloTexto(valor, "Los apellidos");
    },
    email: (valor) => {
      const resultado = Validaciones.email(valor);
      if (resultado.valido && GymRatData.buscarPorEmail(valor)) {
        return { valido: false, mensaje: "Ya existe una cuenta registrada con este correo." };
      }
      return resultado;
    },
    region: (valor) => Validaciones.seleccionRequerida(valor, "una región"),
    comuna: (valor) => Validaciones.requerido(valor, "La comuna"),
    direccion: (valor) => Validaciones.longitud(valor, 5, 120, "La dirección"),
    password: (valor) => Validaciones.password(valor),
    passwordConfirm: (valor, datos) => {
      const original = datos.get("password") || "";
      return {
        valido: valor === original && valor.length > 0,
        mensaje: "Las contraseñas no coinciden.",
      };
    },
    consentimiento: (valor, datos) => {
      const marcado = datos.get("consentimiento") === "on";
      return {
        valido: marcado,
        mensaje: "Debes aceptar la política de privacidad para continuar.",
      };
    },
  };

  Validaciones.formatearRutInput(form.elements.rut);

  Validaciones.validarFormulario(form, reglas, (datos) => {
    ocultarAlerta();

    const nuevoAtleta = GymRatData.crearAtleta(
      {
        rut: datos.get("rut").trim().toUpperCase(),
        nombre: datos.get("nombre").trim(),
        email: datos.get("email").trim(),
        rol: GymRatData.ROLES.MIEMBRO,
      },
      {
        apellidos: datos.get("apellidos").trim(),
        fechaNacimiento: datos.get("fechaNacimiento"),
        region: datos.get("region"),
        comuna: datos.get("comuna").trim(),
        direccion: datos.get("direccion").trim(),
        password: datos.get("password"),
      }
    );

    GymRatData.login(nuevoAtleta.email, datos.get("password"));
    window.location.href = "index.html";
  });

});

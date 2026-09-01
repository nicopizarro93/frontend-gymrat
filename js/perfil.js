/**
 * GymRat - Mi Perfil (perfil.html).
 * Cualquier atleta con sesion activa (MIEMBRO o STAFF) puede ver y editar
 * su informacion y cambiar su contraseña. Las rutinas guardadas viven en
 * su propia pagina (mis-rutinas.html) para no mezclar "cuenta" con
 * "contenido" dentro de la misma pantalla.
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ redirigirA: "login.html" });
  if (!sesion) return;

  actualizarNavSesion("");
  cargarEncabezado();
  cargarVistaInfo();
  wireEdicionInfo();
  wireFormularioInfo();
  wireFormularioPassword();
});

function atletaActual() {
  const sesion = GymRatData.getSesion();
  return sesion ? GymRatData.getAtletaPorId(sesion.id) : null;
}

function iniciales(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);
  const primera = partes[0] ? partes[0][0] : "";
  const segunda = partes[1] ? partes[1][0] : "";
  return (primera + segunda).toUpperCase();
}

function nombreCompleto(atleta) {
  return atleta.apellidos ? atleta.nombre + " " + atleta.apellidos : atleta.nombre;
}

function cargarEncabezado() {
  const atleta = atletaActual();
  if (!atleta) return;

  document.getElementById("avatarGrande").textContent = iniciales(atleta.nombre);
  document.getElementById("nombreHeader").textContent = nombreCompleto(atleta);
  document.getElementById("emailHeader").textContent = atleta.email;

  const badge = document.getElementById("rolHeaderBadge");
  if (atleta.rol === "STAFF") {
    badge.textContent = "Staff / administrador";
    badge.className = "gr-badge gr-badge-red";
  } else {
    badge.textContent = "Miembro";
    badge.className = "gr-badge gr-badge-accent";
  }
}

function cargarVistaInfo() {
  const atleta = atletaActual();
  if (!atleta) return;

  document.getElementById("vistaRut").textContent = atleta.rut;
  document.getElementById("vistaNombre").textContent = nombreCompleto(atleta);
  document.getElementById("vistaEmail").textContent = atleta.email;
  document.getElementById("vistaComuna").textContent = atleta.comuna || "No especificado";
  document.getElementById("vistaDireccion").textContent = atleta.direccion || "No especificado";

  // Se precarga tambien el formulario, para que al entrar en modo edicion
  // ya tenga los valores actuales.
  document.getElementById("rutInfo").value = atleta.rut;
  document.getElementById("rolInfo").value = atleta.rol === "STAFF" ? "Staff (administrador)" : "Miembro";
  document.getElementById("nombre").value = atleta.nombre || "";
  document.getElementById("apellidos").value = atleta.apellidos || "";
  document.getElementById("email").value = atleta.email || "";
  document.getElementById("comuna").value = atleta.comuna || "";
  document.getElementById("direccion").value = atleta.direccion || "";
}

function wireEdicionInfo() {
  const vista = document.getElementById("vistaInfo");
  const form = document.getElementById("formInfo");

  document.getElementById("btnEditarInfo").addEventListener("click", () => {
    vista.classList.add("d-none");
    form.classList.remove("d-none");
  });

  document.getElementById("btnCancelarInfo").addEventListener("click", () => {
    cargarVistaInfo(); // descarta cualquier cambio no guardado
    form.classList.add("d-none");
    vista.classList.remove("d-none");
  });
}

function wireFormularioInfo() {
  const form = document.getElementById("formInfo");
  const vista = document.getElementById("vistaInfo");
  const alerta = document.getElementById("alertaInfo");

  Validaciones.validarFormulario(
    form,
    {
      nombre: (valor) => {
        const req = Validaciones.requerido(valor, "El nombre");
        if (!req.valido) return req;
        return Validaciones.soloTexto(valor, "El nombre");
      },
      email: (valor) => {
        const resultado = Validaciones.email(valor);
        if (!resultado.valido) return resultado;
        const existente = GymRatData.buscarPorEmail(valor);
        const idActual = GymRatData.getSesion().id;
        if (existente && existente.id !== idActual) {
          return { valido: false, mensaje: "Ya existe otra cuenta con este correo." };
        }
        return resultado;
      },
    },
    (datos) => {
      const sesion = GymRatData.getSesion();
      GymRatData.actualizarAtleta(sesion.id, {
        nombre: datos.get("nombre").trim(),
        apellidos: datos.get("apellidos").trim(),
        email: datos.get("email").trim(),
        comuna: datos.get("comuna").trim(),
        direccion: datos.get("direccion").trim(),
      });

      // Refresca la sesion activa (sin la contraseña) para que la navbar
      // y el encabezado reflejen el nuevo nombre/correo de inmediato.
      const actualizado = GymRatData.getAtletaPorId(sesion.id);
      GymRatData.login(actualizado.email, actualizado.password);

      cargarEncabezado();
      cargarVistaInfo();
      form.classList.add("d-none");
      vista.classList.remove("d-none");

      alerta.classList.remove("d-none", "alert-danger");
      alerta.classList.add("alert-success");
      alerta.textContent = "Tu información se actualizó correctamente.";
      actualizarNavSesion("");
    }
  );
}

function wireFormularioPassword() {
  const form = document.getElementById("formPassword");
  const alerta = document.getElementById("alertaPassword");

  Validaciones.validarFormulario(
    form,
    {
      passwordActual: (valor) => {
        const atleta = atletaActual();
        return {
          valido: !!atleta && atleta.password === valor,
          mensaje: "La contraseña actual no es correcta.",
        };
      },
      passwordNueva: (valor) => Validaciones.password(valor),
      passwordNuevaConfirm: (valor, datos) => ({
        valido: valor === (datos.get("passwordNueva") || "") && valor.length > 0,
        mensaje: "Las contraseñas no coinciden.",
      }),
    },
    (datos) => {
      const sesion = GymRatData.getSesion();
      GymRatData.actualizarAtleta(sesion.id, { password: datos.get("passwordNueva") });

      alerta.classList.remove("d-none", "alert-danger");
      alerta.classList.add("alert-success");
      alerta.textContent = "Tu contraseña se actualizó correctamente.";
      form.reset();
      form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
    }
  );
}

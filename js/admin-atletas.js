/**
 * GymRat - Mantenedor de atletas (admin/atletas.html).
 * CRUD completo sobre GymRatData (atletas), protegido para STAFF.
 * El RUT no es editable una vez creado (es el identificador natural del
 * atleta en el backend real).
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ soloStaff: true, redirigirA: "../login.html" });
  if (!sesion) return;

  document.getElementById("btnCerrarSesionAdmin").addEventListener("click", () => {
    GymRatData.logout();
    window.location.href = "../index.html";
  });

  const tablaEl = document.getElementById("tablaAtletas");
  const formEl = document.getElementById("formAtleta");
  const tituloModalEl = document.getElementById("tituloModalAtleta");
  const rutInputEl = document.getElementById("rutAtleta");
  const modalAtleta = new bootstrap.Modal(document.getElementById("modalAtleta"));

  Validaciones.formatearRutInput(rutInputEl);

  function renderTabla() {
    const atletas = GymRatData.getAtletas();
    tablaEl.innerHTML = atletas
      .map(
        (a) => `
      <tr>
        <td>${a.rut}</td>
        <td>${a.nombre}${a.id === sesion.id ? ' <span class="badge bg-secondary">tú</span>' : ""}</td>
        <td>${a.email}</td>
        <td><span class="gr-badge ${a.rol === "STAFF" ? "gr-badge-red" : "gr-badge-outline"}">${a.rol}</span></td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-editar" data-id="${a.id}"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${a.id}" ${a.id === sesion.id ? "disabled title=\"No puedes eliminar tu propia cuenta\"" : ""}><i class="bi bi-trash"></i></button>
        </td>
      </tr>`
      )
      .join("");
  }

  document.getElementById("btnNuevoAtleta").addEventListener("click", () => {
    formEl.reset();
    formEl.elements.idAtleta.value = "";
    rutInputEl.readOnly = false;
    formEl.querySelectorAll(".is-valid, .is-invalid").forEach((el) => el.classList.remove("is-valid", "is-invalid"));
    tituloModalEl.textContent = "Nuevo atleta";
  });

  tablaEl.addEventListener("click", (evento) => {
    const btnEditar = evento.target.closest(".btn-editar");
    const btnEliminar = evento.target.closest(".btn-eliminar");

    if (btnEditar) {
      const atleta = GymRatData.getAtletaPorId(btnEditar.dataset.id);
      if (!atleta) return;
      formEl.elements.idAtleta.value = atleta.id;
      formEl.elements.rutAtleta.value = atleta.rut;
      formEl.elements.nombreAtleta.value = atleta.nombre;
      formEl.elements.emailAtleta.value = atleta.email;
      formEl.elements.rolAtleta.value = atleta.rol;
      rutInputEl.readOnly = true;
      tituloModalEl.textContent = "Editar atleta";
      modalAtleta.show();
    }

    if (btnEliminar) {
      if (btnEliminar.disabled) return;
      const atleta = GymRatData.getAtletaPorId(btnEliminar.dataset.id);
      if (!atleta) return;
      const confirmado = window.confirm('¿Eliminar la cuenta de "' + atleta.nombre + '"? Esta acción no se puede deshacer.');
      if (!confirmado) return;
      GymRatData.eliminarAtleta(atleta.id);
      renderTabla();
    }
  });

  Validaciones.validarFormulario(
    formEl,
    {
      rutAtleta: (valor, datos) => {
        const resultado = Validaciones.rut(valor);
        if (!resultado.valido) return resultado;
        const idActual = datos.get("idAtleta");
        const existente = GymRatData.buscarPorRut(valor.trim().toUpperCase());
        if (existente && String(existente.id) !== idActual) {
          return { valido: false, mensaje: "Ya existe otro atleta con este RUT." };
        }
        return resultado;
      },
      nombreAtleta: (valor) => {
        const req = Validaciones.requerido(valor, "El nombre");
        if (!req.valido) return req;
        return Validaciones.soloTexto(valor, "El nombre");
      },
      emailAtleta: (valor, datos) => {
        const resultado = Validaciones.email(valor);
        if (!resultado.valido) return resultado;
        const idActual = datos.get("idAtleta");
        const existente = GymRatData.buscarPorEmail(valor);
        if (existente && String(existente.id) !== idActual) {
          return { valido: false, mensaje: "Ya existe otro atleta con este correo." };
        }
        return resultado;
      },
      rolAtleta: (valor) => Validaciones.seleccionRequerida(valor, "un rol"),
    },
    (datos) => {
      const id = datos.get("idAtleta");
      const dto = {
        rut: datos.get("rutAtleta").trim().toUpperCase(),
        nombre: datos.get("nombreAtleta").trim(),
        email: datos.get("emailAtleta").trim(),
        rol: datos.get("rolAtleta"),
      };

      if (id) {
        GymRatData.actualizarAtleta(id, dto);
      } else {
        GymRatData.crearAtleta(dto);
      }

      modalAtleta.hide();
      renderTabla();
    }
  );

  renderTabla();
});

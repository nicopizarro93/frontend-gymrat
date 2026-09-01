/**
 * GymRat - Mantenedor de ejercicios (admin/ejercicios.html).
 * CRUD completo sobre GymRatData (ejercicios), protegido para STAFF.
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ soloStaff: true, redirigirA: "../login.html" });
  if (!sesion) return;

  document.getElementById("btnCerrarSesionAdmin").addEventListener("click", () => {
    GymRatData.logout();
    window.location.href = "../index.html";
  });

  const tablaEl = document.getElementById("tablaEjercicios");
  const formEl = document.getElementById("formEjercicio");
  const tituloModalEl = document.getElementById("tituloModalEjercicio");
  const modalEjercicio = new bootstrap.Modal(document.getElementById("modalEjercicio"));

  function badgeDificultad(dificultad) {
    const clases = { PRINCIPIANTE: "gr-badge-outline", INTERMEDIO: "gr-badge-accent", AVANZADO: "gr-badge-red" };
    return '<span class="gr-badge ' + (clases[dificultad] || "gr-badge-outline") + '">' + dificultad + "</span>";
  }

  function renderTabla() {
    const ejercicios = GymRatData.getEjercicios();
    tablaEl.innerHTML = ejercicios
      .map(
        (e) => `
      <tr>
        <td>${e.idEjercicio}</td>
        <td>${e.nombreEjercicio}</td>
        <td>${e.grupoMuscular}</td>
        <td>${badgeDificultad(e.dificultad)}</td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-editar" data-id="${e.idEjercicio}"><i class="bi bi-pencil"></i></button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${e.idEjercicio}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`
      )
      .join("");
  }

  document.getElementById("btnNuevoEjercicio").addEventListener("click", () => {
    formEl.reset();
    formEl.elements.idEjercicio.value = "";
    formEl.querySelectorAll(".is-valid, .is-invalid").forEach((el) => el.classList.remove("is-valid", "is-invalid"));
    tituloModalEl.textContent = "Nuevo ejercicio";
  });

  tablaEl.addEventListener("click", (evento) => {
    const btnEditar = evento.target.closest(".btn-editar");
    const btnEliminar = evento.target.closest(".btn-eliminar");

    if (btnEditar) {
      const ejercicio = GymRatData.getEjercicioPorId(btnEditar.dataset.id);
      if (!ejercicio) return;
      formEl.elements.idEjercicio.value = ejercicio.idEjercicio;
      formEl.elements.nombreEjercicio.value = ejercicio.nombreEjercicio;
      formEl.elements.grupoMuscular.value = ejercicio.grupoMuscular;
      formEl.elements.dificultad.value = ejercicio.dificultad;
      tituloModalEl.textContent = "Editar ejercicio";
      modalEjercicio.show();
    }

    if (btnEliminar) {
      const ejercicio = GymRatData.getEjercicioPorId(btnEliminar.dataset.id);
      if (!ejercicio) return;
      const confirmado = window.confirm('¿Eliminar el ejercicio "' + ejercicio.nombreEjercicio + '"? Esta acción no se puede deshacer.');
      if (!confirmado) return;
      GymRatData.eliminarEjercicio(ejercicio.idEjercicio);
      renderTabla();
    }
  });

  Validaciones.validarFormulario(
    formEl,
    {
      nombreEjercicio: (valor) => Validaciones.longitud(valor, 3, 60, "El nombre del ejercicio"),
      grupoMuscular: (valor) => Validaciones.seleccionRequerida(valor, "un grupo muscular"),
      dificultad: (valor) => Validaciones.seleccionRequerida(valor, "una dificultad"),
    },
    (datos) => {
      const id = datos.get("idEjercicio");
      const dto = {
        nombreEjercicio: datos.get("nombreEjercicio").trim(),
        grupoMuscular: datos.get("grupoMuscular"),
        dificultad: datos.get("dificultad"),
      };

      if (id) {
        GymRatData.actualizarEjercicio(id, dto);
      } else {
        GymRatData.crearEjercicio(dto);
      }

      modalEjercicio.hide();
      renderTabla();
    }
  );

  renderTabla();
});

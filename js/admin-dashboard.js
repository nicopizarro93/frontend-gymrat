/**
 * GymRat - Dashboard del panel admin (admin/index.html).
 * Protegido: solo accesible con sesion de rol STAFF.
 */
document.addEventListener("DOMContentLoaded", () => {
  const sesion = GymRatData.exigirSesion({ soloStaff: true, redirigirA: "../login.html" });
  if (!sesion) return;

  document.getElementById("saludoAdmin").textContent = "Hola, " + sesion.nombre;

  const btnSalir = document.getElementById("btnCerrarSesionAdmin");
  btnSalir.addEventListener("click", () => {
    GymRatData.logout();
    window.location.href = "../index.html";
  });

  const ejercicios = GymRatData.getEjercicios();
  const rutinas = GymRatData.getRutinas();
  const atletas = GymRatData.getAtletas();
  const staff = atletas.filter((a) => a.rol === GymRatData.ROLES.STAFF);

  document.getElementById("statEjercicios").textContent = ejercicios.length;
  document.getElementById("statRutinas").textContent = rutinas.length;
  document.getElementById("statAtletas").textContent = atletas.length;
  document.getElementById("statStaff").textContent = staff.length;

  const ultimos = atletas.slice(-5).reverse();
  document.getElementById("tablaUltimosAtletas").innerHTML = ultimos
    .map(
      (a) => `
    <tr>
      <td>${a.nombre}</td>
      <td>${a.rut}</td>
      <td><span class="gr-badge ${a.rol === "STAFF" ? "gr-badge-red" : "gr-badge-outline"}">${a.rol}</span></td>
    </tr>`
    )
    .join("");

  const conteoPorGrupo = GymRatData.GRUPOS_MUSCULARES.map((grupo) => ({
    grupo,
    cantidad: ejercicios.filter((e) => e.grupoMuscular === grupo).length,
  }));

  document.getElementById("listaGrupos").innerHTML = conteoPorGrupo
    .map(
      (item) => `
    <li class="list-group-item d-flex justify-content-between">
      <span>${item.grupo}</span>
      <span class="badge bg-dark rounded-pill">${item.cantidad}</span>
    </li>`
    )
    .join("");
});

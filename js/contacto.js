// Validaciones del formulario de contacto (pages/contacto.html)

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("formContacto").addEventListener("submit", validarFormularioContacto);
});

function validarFormularioContacto(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("contactoNombre");
  const email = document.getElementById("contactoEmail");
  const asunto = document.getElementById("contactoAsunto");
  const mensaje = document.getElementById("contactoMensaje");

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let esValido = true;
  esValido = validarCampo(nombre, nombre.value.trim().length >= 3) && esValido;
  esValido = validarCampo(email, regexEmail.test(email.value.trim())) && esValido;
  esValido = validarCampo(asunto, asunto.value !== "") && esValido;
  esValido = validarCampo(mensaje, mensaje.value.trim().length >= 10) && esValido;

  const alerta = document.getElementById("alertaExito");

  if (!esValido) {
    alerta.classList.add("d-none");
    return;
  }

  alerta.classList.remove("d-none");
  alerta.textContent = "Mensaje registrado (formulario de demostración, no se envía a ningún correo real).";
  document.getElementById("formContacto").reset();
  [nombre, email, asunto, mensaje].forEach((campo) => campo.classList.remove("is-invalid"));
}

// Marca un campo como válido/inválido y devuelve el resultado (para encadenar)
function validarCampo(elemento, condicion) {
  elemento.classList.toggle("is-invalid", !condicion);
  return condicion;
}
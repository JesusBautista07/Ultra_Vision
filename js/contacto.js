/** Valida el formulario de contacto y muestra un aviso si todo es correcto */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("formContacto").addEventListener("submit", validarFormularioContacto);
});

function validarFormularioContacto(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("contactoNombre");
  const email = document.getElementById("contactoEmail");
  const asunto = document.getElementById("contactoAsunto");
  const mensaje = document.getElementById("contactoMensaje");
  const pass = document.getElementById("contactoPass");
  const passConfirm = document.getElementById("contactoPassConfirm");

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let esValido = true;

  esValido = validarCampo(nombre, nombre.value.trim().length >= 3) && esValido;
  esValido = validarCampo(email, regexEmail.test(email.value.trim())) && esValido;
  esValido = validarCampo(asunto, asunto.value !== "") && esValido;
  esValido = validarCampo(mensaje, mensaje.value.trim().length >= 10) && esValido;

  // La contraseña es opcional, pero si se llena un campo, ambos deben ser válidos
  const hayPassword = pass.value.length > 0 || passConfirm.value.length > 0;
  if (hayPassword) {
    esValido = validarCampo(pass, pass.value.length >= 8) && esValido;
    esValido = validarCampo(passConfirm, passConfirm.value === pass.value && pass.value.length >= 8) && esValido;
  } else {
    pass.classList.remove("is-invalid");
    passConfirm.classList.remove("is-invalid");
  }

  const alerta = document.getElementById("alertaExito");

  if (!esValido) {
    alerta.classList.add("d-none");
    return;
  }

  alerta.classList.remove("d-none");
  document.getElementById("formContacto").reset();
  [nombre, email, asunto, mensaje, pass, passConfirm].forEach((campo) => campo.classList.remove("is-invalid"));
}

/** Valida un campo y lo marca como inválido si no cumple la condición */
function validarCampo(elemento, condicion) {
  elemento.classList.toggle("is-invalid", !condicion);
  return condicion;
}
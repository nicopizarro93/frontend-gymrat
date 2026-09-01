/**
 * GymRat - Validaciones de formularios (JS puro)
 * ------------------------------------------------------------
 * Funciones de validacion reutilizables en todas las paginas, mas un
 * pequeno "motor" para conectarlas a un <form> de Bootstrap 5 usando
 * las clases .is-valid / .is-invalid y .invalid-feedback.
 *
 * No se usa el modo nativo was-validated de Bootstrap porque este solo
 * muestra los mensajes de validacion del propio HTML5 (pattern, required,
 * etc.). Aqui se necesitan reglas propias (digito verificador de RUT,
 * dominios de correo permitidos, edad minima, etc.), asi que el feedback
 * se controla a mano con las mismas clases visuales de Bootstrap.
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------
  // Validadores individuales
  // Cada uno devuelve { valido: boolean, mensaje: string }
  // ---------------------------------------------------------------

  function requerido(valor, etiqueta) {
    const texto = (valor || "").toString().trim();
    return {
      valido: texto.length > 0,
      mensaje: (etiqueta || "Este campo") + " es obligatorio.",
    };
  }

  function longitud(valor, min, max, etiqueta) {
    const texto = (valor || "").toString().trim();
    const valido = texto.length >= min && texto.length <= max;
    return {
      valido: valido,
      mensaje: (etiqueta || "Este campo") + " debe tener entre " + min + " y " + max + " caracteres.",
    };
  }

  function soloTexto(valor, etiqueta) {
    const patron = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    return {
      valido: patron.test((valor || "").trim()),
      mensaje: (etiqueta || "Este campo") + " solo puede contener letras y espacios.",
    };
  }

  function email(valor) {
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valido: patron.test((valor || "").trim()),
      mensaje: "Ingresa un correo electrónico válido.",
    };
  }

  // Usado en el formulario de Contacto (Anexo 1): solo se aceptan
  // correos de estos dominios.
  function emailConDominio(valor, dominiosPermitidos) {
    const resultado = email(valor);
    if (!resultado.valido) return resultado;
    const dominio = valor.trim().split("@")[1].toLowerCase();
    const permitido = dominiosPermitidos.some((d) => d.toLowerCase() === dominio);
    return {
      valido: permitido,
      mensaje: "El correo debe pertenecer a uno de estos dominios: " + dominiosPermitidos.join(", ") + ".",
    };
  }

  // Contraseña: 4 a 10 caracteres (regla del Anexo 1).
  function password(valor) {
    const texto = (valor || "").toString();
    return {
      valido: texto.length >= 4 && texto.length <= 10,
      mensaje: "La contraseña debe tener entre 4 y 10 caracteres.",
    };
  }

  // RUT chileno sin puntos y con guion (formato que exige el backend real:
  // ^\d{7,8}-[0-9Kk]$), con verificacion del digito verificador (modulo 11).
  function rut(valor) {
    const texto = (valor || "").toString().trim().toUpperCase();
    const patron = /^\d{7,8}-[0-9K]$/;

    if (!patron.test(texto)) {
      return {
        valido: false,
        mensaje: "El RUT debe tener el formato 12345678-9, sin puntos y con guion.",
      };
    }

    const [numero, dvIngresado] = texto.split("-");
    const dvCalculado = calcularDigitoVerificador(numero);

    return {
      valido: dvCalculado === dvIngresado,
      mensaje: "El RUT ingresado no es válido (dígito verificador incorrecto).",
    };
  }

  function calcularDigitoVerificador(numero) {
    let suma = 0;
    let multiplo = 2;
    for (let i = numero.length - 1; i >= 0; i--) {
      suma += parseInt(numero.charAt(i), 10) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const resto = 11 - (suma % 11);
    if (resto === 11) return "0";
    if (resto === 10) return "K";
    return String(resto);
  }

  // Da formato "12345678-9" a medida que el usuario escribe: quita todo
  // lo que no sea digito o K, y agrega el guion antes del ultimo caracter.
  function formatearRutInput(inputEl) {
    inputEl.addEventListener("input", () => {
      let valor = inputEl.value.toUpperCase().replace(/[^0-9K]/g, "");
      if (valor.length > 1) {
        valor = valor.slice(0, -1) + "-" + valor.slice(-1);
      }
      inputEl.value = valor.slice(0, 10);
    });
  }

  // Fecha de nacimiento: fecha valida, no futura, y con una edad minima.
  function fechaNacimiento(valor, edadMinima) {
    if (!valor) {
      return { valido: false, mensaje: "La fecha de nacimiento es obligatoria." };
    }
    const fecha = new Date(valor + "T00:00:00");
    if (Number.isNaN(fecha.getTime())) {
      return { valido: false, mensaje: "La fecha de nacimiento no es válida." };
    }
    const hoy = new Date();
    if (fecha > hoy) {
      return { valido: false, mensaje: "La fecha de nacimiento no puede ser futura." };
    }
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const noHaCumplidoEsteAnio =
      hoy.getMonth() < fecha.getMonth() ||
      (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate());
    if (noHaCumplidoEsteAnio) edad -= 1;

    const minima = edadMinima || 0;
    return {
      valido: edad >= minima,
      mensaje: "Debes tener al menos " + minima + " años para registrarte.",
    };
  }

  // Numero: usado para precio, stock, dias de rutina, etc.
  function numeroEnRango(valor, min, max, etiqueta) {
    const numero = Number(valor);
    const valido = valor !== "" && !Number.isNaN(numero) && numero >= min && numero <= max;
    return {
      valido: valido,
      mensaje: (etiqueta || "El valor") + " debe ser un número entre " + min + " y " + max + ".",
    };
  }

  function seleccionRequerida(valor, etiqueta) {
    return {
      valido: !!valor,
      mensaje: "Debes seleccionar " + (etiqueta || "una opción") + ".",
    };
  }

  // ---------------------------------------------------------------
  // Motor de conexion con el DOM (Bootstrap 5)
  // ---------------------------------------------------------------

  // Aplica el resultado de una validacion a un input, mostrando/ocultando
  // las clases y el mensaje de Bootstrap (.is-invalid / .invalid-feedback).
  function aplicarResultado(inputEl, resultado) {
    let feedback = inputEl.parentElement.querySelector(".invalid-feedback[data-validacion]");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "invalid-feedback";
      feedback.setAttribute("data-validacion", "true");
      inputEl.insertAdjacentElement("afterend", feedback);
    }

    if (resultado.valido) {
      inputEl.classList.remove("is-invalid");
      inputEl.classList.add("is-valid");
    } else {
      inputEl.classList.remove("is-valid");
      inputEl.classList.add("is-invalid");
      feedback.textContent = resultado.mensaje;
    }
    return resultado.valido;
  }

  /**
   * Conecta un formulario a un conjunto de reglas de validacion.
   *
   * reglas: { nombreCampo: (valor, formData) => { valido, mensaje } }
   *
   * Valida en vivo (evento "input"/"change") y bloquea el submit si algo
   * no es valido, enfocando el primer campo con error.
   */
  function validarFormulario(formEl, reglas, alEnviarValido) {
    if (!formEl) return;

    function validarCampo(nombre) {
      const campo = formEl.elements[nombre];
      if (!campo || !reglas[nombre]) return true;
      const datos = new FormData(formEl);
      const resultado = reglas[nombre](campo.value, datos);
      return aplicarResultado(campo, resultado);
    }

    Object.keys(reglas).forEach((nombre) => {
      const campo = formEl.elements[nombre];
      if (!campo) return;
      const evento = campo.tagName === "SELECT" || campo.type === "checkbox" || campo.type === "radio" ? "change" : "input";
      campo.addEventListener(evento, () => validarCampo(nombre));
      campo.addEventListener("blur", () => validarCampo(nombre));
    });

    formEl.addEventListener("submit", (evento) => {
      let formularioValido = true;
      let primerCampoInvalido = null;

      Object.keys(reglas).forEach((nombre) => {
        const esValido = validarCampo(nombre);
        if (!esValido) {
          formularioValido = false;
          if (!primerCampoInvalido) primerCampoInvalido = formEl.elements[nombre];
        }
      });

      if (!formularioValido) {
        evento.preventDefault();
        if (primerCampoInvalido) primerCampoInvalido.focus();
        return;
      }

      if (typeof alEnviarValido === "function") {
        evento.preventDefault();
        alEnviarValido(new FormData(formEl));
      }
    });
  }

  // ---------------------------------------------------------------
  // API publica
  // ---------------------------------------------------------------

  global.Validaciones = {
    requerido: requerido,
    longitud: longitud,
    soloTexto: soloTexto,
    email: email,
    emailConDominio: emailConDominio,
    password: password,
    rut: rut,
    formatearRutInput: formatearRutInput,
    fechaNacimiento: fechaNacimiento,
    numeroEnRango: numeroEnRango,
    seleccionRequerida: seleccionRequerida,
    aplicarResultado: aplicarResultado,
    validarFormulario: validarFormulario,
  };
})(window);

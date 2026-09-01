# GymRat — Frontend (Evaluación Parcial 1, DSY1104)

Frontend estático (HTML + CSS + JavaScript + Bootstrap 5) para GymRat, la
plataforma de gestión de rutinas de gimnasio cuyo backend (microservicios
Spring Boot) está en la carpeta hermana `Proyect-GymRat/`.

Este frontend usa una **capa de datos simulada** (mock, con `localStorage`)
en vez de conectarse al backend real, porque este último todavía no expone
seguridad/CORS ni autenticación (JWT). La integración real está planificada
para la Evaluación 3. Los objetos que maneja la capa mock replican
exactamente los campos de los DTOs reales del backend, para que ese cambio
sea lo más directo posible.

## Cómo ejecutarlo

No requiere instalación ni build. Basta con abrir `index.html` en el
navegador, o servir la carpeta con cualquier servidor estático (por ejemplo
la extensión "Live Server" de VS Code) para evitar restricciones de
`file://` en algunos navegadores. Requiere conexión a internet la primera
vez (Bootstrap, Bootstrap Icons y Google Fonts se cargan desde CDN).

## Estructura

```
frontend/
├── index.html                Home
├── registro.html              Crear cuenta
├── login.html                 Iniciar sesión
├── nosotros.html               Nosotros
├── blog.html                   Listado del blog
├── blog-detalle-1.html         Detalle: errores comunes al armar rutina
├── blog-detalle-2.html         Detalle: progresión de carga
├── contacto.html                Formulario de contacto
├── ejercicios.html              Catálogo filtrable + constructor de rutina
├── ejercicio-detalle.html       Detalle de un ejercicio (?id=N)
├── privacidad.html              Política de privacidad (Ley 21.719)
├── admin/
│   ├── index.html                Dashboard
│   ├── ejercicios.html           Mantenedor CRUD de ejercicios
│   └── atletas.html              Mantenedor CRUD de atletas
├── css/
│   └── styles.css                Sistema de diseño propio (sobre Bootstrap 5)
└── js/
    ├── mock-data.js              Capa de datos simulada (localStorage)
    ├── validaciones.js           Validaciones reutilizables + motor de formularios
    ├── sesion-ui.js               Sincroniza la navbar con la sesión activa
    └── ...                        Un script por página (home.js, registro.js, etc.)
```

## Cuentas de prueba

| Rol   | Correo                     | RUT          | Contraseña |
|-------|-----------------------------|--------------|------------|
| STAFF (admin) | admin@gymrat.cl      | 18345678-9   | admin123   |
| MIEMBRO       | matias.fernandez@gmail.com | 19222333-4 | socio123 |
| MIEMBRO       | valentina.soto@gmail.com   | 20111222-3 | socio123 |

El login acepta tanto el correo como el RUT como identificador. Los datos
se guardan en el `localStorage` del navegador: para reiniciarlos, borra los
datos del sitio o el `localStorage` de la pestaña.

## Mapeo mock → backend real (para la Evaluación 3)

| Entidad  | Campos del mock (`mock-data.js`)                                   | DTO real del backend                        |
|----------|----------------------------------------------------------------------|----------------------------------------------|
| Atleta   | `rut, nombre, email, rol`                                            | `AtletaRequestDTO` (ms-atletas)               |
| Ejercicio| `nombreEjercicio, grupoMuscular, dificultad`                         | `EjercicioRequestDTO` (ms-ejercicios)         |
| Rutina   | `nombreRutina, dificultad, dias, ejerciciosIds`                      | `Rutina` / `RutinaResponseDTO` (ms-rutinas)   |

Campos como `password`, `apellidos`, `fechaNacimiento`, `region`, `comuna`
y `direccion` **no existen todavía en el backend real** y se manejan solo
en el frontend (documentado también en los comentarios de `mock-data.js`).
Se agregaron para cumplir con las validaciones del enunciado de esta
evaluación (Anexo 1) mientras el backend no los soporta.

Para integrar de verdad en la Evaluación 3, el plan es reemplazar las
funciones de `GymRatData` (que hoy leen/escriben `localStorage`) por
llamadas `fetch()` a `http://localhost:8080/api/v1/...` (API Gateway), sin
tener que tocar el HTML ni las páginas que las consumen.

## Cumplimiento de la rúbrica (Situación 1)

- **HTML semántico + navbar/footer** (`IE1.1.1`): `<header>`, `<nav>`,
  `<main>`/`<section>`, `<article>` (blog) y `<footer>` en todas las
  páginas; navbar y footer se repiten en cada archivo porque no se usan
  includes (limitación de `file://`).
- **Hoja de estilos externa personalizada** (`IE1.1.2`): `css/styles.css`,
  con variables propias, sistema de colores, tipografía y componentes
  encima de Bootstrap 5 (no es solo Bootstrap).
- **Validaciones en JavaScript** (`IE1.2.1`): `js/validaciones.js`
  (RUT con dígito verificador, dominios de correo, contraseña, edad
  mínima, etc.), conectado a cada formulario sin depender de la
  validación nativa del navegador.
- **Commits/colaboración en GitHub** (`IE1.3.1`): a cargo del equipo.

## Cumplimiento de la Ley N° 21.719

- Checkbox de consentimiento explícito (no premarcado) en el registro,
  con enlace a `privacidad.html`.
- `privacidad.html` documenta responsable, finalidad, datos recolectados,
  derechos ARCO+ y cómo ejercerlos.
- El sistema declara explícitamente que **no** recolecta datos de salud
  ni biométricos (art. 16 bis), dado el riesgo específico que tiene ese
  tipo de datos en un contexto deportivo.

## Limitaciones conocidas de esta entrega

- No hay integración real con el backend (pendiente de seguridad/CORS/JWT
  en `Proyect-GymRat`, planificado para más adelante).
- El formulario de contacto no persiste a un backend real (es esperado:
  no existe un microservicio de contacto).
- Los datos se pierden si se borra el `localStorage` del navegador; es
  intencional para esta etapa del proyecto.

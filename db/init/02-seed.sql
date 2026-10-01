-- Seed de datos de ejemplo. Orden por claves foraneas:
-- pruebas, tareas, participantes, observaciones, hallazgos.

INSERT INTO pruebas (nombre, producto_evaluado, descripcion, fecha, estado) VALUES
('Prueba de compra en linea', 'Tienda web', 'Evaluacion del flujo de busqueda, carrito y pago', '2026-10-01', 'finalizada'),
('Prueba de app movil bancaria', 'App de banca', 'Evaluacion de inicio de sesion y transferencias', '2026-10-05', 'en_curso');

INSERT INTO tareas (prueba_id, titulo, descripcion, resultado_esperado) VALUES
(1, 'Buscar un producto', 'Encontrar un producto usando el buscador', 'Lo encuentra en menos de 1 minuto'),
(1, 'Agregar al carrito', 'Agregar el producto encontrado al carrito', 'El carrito muestra el producto'),
(1, 'Completar el pago', 'Pagar con tarjeta desde el carrito', 'Recibe la confirmacion de compra'),
(2, 'Iniciar sesion', 'Entrar a la app con usuario y clave', 'Accede a la pantalla principal'),
(2, 'Hacer una transferencia', 'Transferir dinero a un contacto', 'Ve el comprobante de la transferencia');

INSERT INTO participantes (nombre, edad, ocupacion, experiencia, email) VALUES
('Ana Torres', 24, 'Estudiante', 'alta', 'ana.torres@mail.com'),
('Luis Paredes', 35, 'Contador', 'media', 'luis.paredes@mail.com'),
('Marta Gomez', 52, 'Docente', 'baja', 'marta.gomez@mail.com'),
('Diego Vera', 29, 'Disenador', 'alta', 'diego.vera@mail.com'),
('Sofia Rios', 41, 'Enfermera', 'media', 'sofia.rios@mail.com'),
('Carlos Mena', 19, 'Estudiante', 'baja', 'carlos.mena@mail.com');

INSERT INTO observaciones (prueba_id, tarea_id, participante_id, descripcion, completada, tiempo_seg, errores) VALUES
(1, 1, 1, 'Uso el buscador sin problemas', 1, 25, 0),
(1, 1, 2, 'Dudo entre el buscador y el menu', 1, 48, 1),
(1, 1, 3, 'No encontro el buscador al inicio', 1, 95, 2),
(1, 2, 1, 'Agrego el producto rapidamente', 1, 20, 0),
(1, 2, 2, 'Confundio el boton de favoritos con el de carrito', 1, 60, 2),
(1, 3, 1, 'Completo el pago sin ayuda', 1, 110, 1),
(1, 3, 2, 'Se perdio en el formulario de pago', 0, 210, 4),
(1, 3, 3, 'Abandono por los campos obligatorios ocultos', 0, 240, 5),
(2, 4, 4, 'Inicio sesion a la primera', 1, 15, 0),
(2, 4, 5, 'Olvido la clave y uso recuperar acceso', 1, 130, 2),
(2, 5, 4, 'Encontro la opcion de transferir con rapidez', 1, 55, 0),
(2, 5, 6, 'No entendio el paso de confirmacion', 0, 180, 3);

INSERT INTO hallazgos (prueba_id, observacion_id, titulo, descripcion, severidad, frecuencia, recomendacion, estado) VALUES
(1, 7, 'Formulario de pago confuso', 'Los usuarios no entienden que campos son obligatorios', 'catastrofica', 5, 'Simplificar el formulario y marcar los campos obligatorios', 'abierto'),
(1, 8, 'Campos obligatorios ocultos', 'Un campo del pago aparece solo al hacer scroll', 'mayor', 4, 'Mostrar todos los campos visibles sin scroll', 'en_correccion'),
(1, 3, 'Buscador poco visible', 'El buscador se confunde con el resto del encabezado', 'mayor', 3, 'Aumentar el contraste y tamano del buscador', 'abierto'),
(1, 5, 'Boton de favoritos parecido al carrito', 'Los iconos son similares y generan errores', 'menor', 2, 'Cambiar el icono de favoritos', 'resuelto'),
(1, NULL, 'Mensaje de exito poco claro', 'La confirmacion de compra pasa desapercibida', 'menor', 2, 'Mostrar una pantalla de confirmacion completa', 'abierto'),
(2, 10, 'Recuperar clave escondido', 'El enlace de recuperar acceso es pequeno', 'menor', 2, 'Hacer mas visible el enlace de recuperacion', 'en_correccion'),
(2, 12, 'Paso de confirmacion ambiguo', 'No queda claro si la transferencia ya se realizo', 'mayor', 3, 'Agregar un resumen previo a confirmar', 'abierto'),
(2, NULL, 'Colores poco consistentes', 'Los botones cambian de color entre pantallas', 'cosmetica', 1, 'Unificar la paleta de botones', 'abierto');
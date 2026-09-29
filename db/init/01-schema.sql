CREATE TABLE pruebas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  producto_evaluado VARCHAR(150) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  estado ENUM('planificada','en_curso','finalizada') DEFAULT 'planificada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prueba_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  resultado_esperado TEXT,
  FOREIGN KEY (prueba_id) REFERENCES pruebas(id) ON DELETE CASCADE
);

CREATE TABLE participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  edad INT,
  ocupacion VARCHAR(100),
  experiencia ENUM('baja','media','alta') DEFAULT 'media',
  email VARCHAR(120)
);

CREATE TABLE observaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prueba_id INT NOT NULL,
  tarea_id INT NOT NULL,
  participante_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  completada BOOLEAN DEFAULT FALSE,
  tiempo_seg INT,
  errores INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prueba_id) REFERENCES pruebas(id) ON DELETE CASCADE,
  FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE
);

CREATE TABLE hallazgos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prueba_id INT NOT NULL,
  observacion_id INT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  severidad ENUM('cosmetica','menor','mayor','catastrofica') NOT NULL,
  frecuencia INT DEFAULT 1,
  recomendacion TEXT,
  estado ENUM('abierto','en_correccion','resuelto') DEFAULT 'abierto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prueba_id) REFERENCES pruebas(id) ON DELETE CASCADE,
  FOREIGN KEY (observacion_id) REFERENCES observaciones(id) ON DELETE SET NULL
);

CREATE TABLE plan_pruebas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prueba_id INT NOT NULL,
  objetivos TEXT,
  perfil_usuarios TEXT,
  metodo VARCHAR(100),
  tareas_plan TEXT,
  metricas TEXT,
  guion_moderacion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prueba_id) REFERENCES pruebas(id) ON DELETE CASCADE
);
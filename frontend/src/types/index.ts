export type Severidad = "cosmetica" | "menor" | "mayor" | "catastrofica";

export interface Prueba {
  id: number;
  nombre: string;
  producto_evaluado: string;
  descripcion?: string;
  fecha: string;
  estado: "planificada" | "en_curso" | "finalizada";
}

export interface Tarea {
  id: number;
  prueba_id: number;
  titulo: string;
  descripcion?: string;
  resultado_esperado?: string;
}

export interface Participante {
  id: number;
  nombre: string;
  edad?: number;
  ocupacion?: string;
  experiencia: "baja" | "media" | "alta";
  email?: string;
}

export interface Observacion {
  id: number;
  prueba_id: number;
  tarea_id: number;
  participante_id: number;
  descripcion: string;
  completada: boolean;
  tiempo_seg?: number | null;
  errores: number;
  prueba_nombre?: string;
  tarea_nombre?: string;
  participante_nombre?: string;
  created_at?: string;
}

export type EstadoHallazgo = "abierto" | "en_correccion" | "resuelto";

export interface Hallazgo {
  id: number;
  prueba_id: number;
  observacion_id?: number | null;
  titulo: string;
  descripcion?: string;
  severidad: Severidad;
  frecuencia: number;
  recomendacion?: string;
  estado: EstadoHallazgo;
  prueba_nombre?: string;
  observacion_descripcion?: string;
  created_at?: string;
}
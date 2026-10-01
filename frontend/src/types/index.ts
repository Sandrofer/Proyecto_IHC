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

export interface Hallazgo {
  id: number;
  prueba_id: number;
  observacion_id?: number | null;
  titulo: string;
  descripcion?: string;
  severidad: Severidad;
  frecuencia: number;
  recomendacion?: string;
  estado: "abierto" | "en_correccion" | "resuelto";
}

export interface DashboardTotales {
  pruebas: number;
  participantes: number;
  observaciones: number;
  hallazgos: number;
}

export interface DashboardSeveridad {
  cosmetica: number;
  menor: number;
  mayor: number;
  catastrofica: number;
}

export interface DashboardEstado {
  abierto: number;
  en_correccion: number;
  resuelto: number;
}

export interface DashboardTarea {
  titulo: string;
  tasa_exito: number;
  tiempo_promedio_seg: number;
  errores_promedio: number;
}

export interface DashboardTopHallazgo {
  id: number;
  titulo: string;
  severidad: Severidad;
  frecuencia: number;
}

export interface DashboardResumen {
  totales: DashboardTotales;
  hallazgos_por_severidad: DashboardSeveridad;
  hallazgos_por_estado: DashboardEstado;
  tareas: DashboardTarea[];
  top_hallazgos: DashboardTopHallazgo[];
export interface PlanPrueba {
  id: number;
  prueba_id: number;
  prueba_nombre?: string;
  objetivos?: string | null;
  perfil_usuarios?: string | null;
  metodo?: string | null;
  tareas_plan?: string | null;
  metricas?: string | null;
  guion_moderacion?: string | null;
  created_at: string;
}
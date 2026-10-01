/**
 * MOCK DE DATOS - SOLO PARA PRUEBAS Y DESARROLLO LOCAL
 * Estructura de respuesta del endpoint GET /api/dashboard/resumen
 */
import type { DashboardResumen } from "@/types";

export const DASHBOARD_MOCK: DashboardResumen = {
  totales: {
    pruebas: 4,
    participantes: 18,
    observaciones: 72,
    hallazgos: 15,
  },
  hallazgos_por_severidad: {
    cosmetica: 3,
    menor: 6,
    mayor: 4,
    catastrofica: 2,
  },
  hallazgos_por_estado: {
    abierto: 7,
    en_correccion: 5,
    resuelto: 3,
  },
  tareas: [
    {
      titulo: "Iniciar sesión con Google o correo",
      tasa_exito: 94,
      tiempo_promedio_seg: 32,
      errores_promedio: 0.2,
    },
    {
      titulo: "Buscar producto aplicando filtros",
      tasa_exito: 82,
      tiempo_promedio_seg: 58,
      errores_promedio: 0.7,
    },
    {
      titulo: "Agregar producto al carrito de compras",
      tasa_exito: 75,
      tiempo_promedio_seg: 74,
      errores_promedio: 1.1,
    },
    {
      titulo: "Completar proceso de checkout y pago",
      tasa_exito: 48,
      tiempo_promedio_seg: 136,
      errores_promedio: 2.5,
    },
    {
      titulo: "Editar dirección de envío en perfil",
      tasa_exito: 88,
      tiempo_promedio_seg: 45,
      errores_promedio: 0.4,
    },
  ],
  top_hallazgos: [
    {
      id: 1,
      titulo: "El botón de pago no responde en Safari móvil",
      severidad: "catastrofica",
      frecuencia: 8,
    },
    {
      id: 2,
      titulo: "Confusión con el selector de método de envío",
      severidad: "mayor",
      frecuencia: 6,
    },
    {
      id: 3,
      titulo: "Mensaje de validación ambiguo en el código postal",
      severidad: "menor",
      frecuencia: 5,
    },
    {
      id: 4,
      titulo: "Bajo contraste en el botón secundario del carrito",
      severidad: "cosmetica",
      frecuencia: 4,
    },
    {
      id: 5,
      titulo: "Cierre de sesión inesperado al recargar la página de checkout",
      severidad: "mayor",
      frecuencia: 3,
    },
  ],
};

/**
 * Función auxiliar para obtener el mock (simula llamada asíncrona)
 */
export async function getDashboardResumenMock(): Promise<DashboardResumen> {
  // Simulación de pequeña latencia de red
  await new Promise((resolve) => setTimeout(resolve, 300));
  return DASHBOARD_MOCK;
}

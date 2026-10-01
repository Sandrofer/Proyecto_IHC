"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "@/lib/api";
import { Observacion, Prueba, Tarea, Participante } from "@/types";
import { DataTable, Column } from "@/components/DataTable";
import { FormField } from "@/components/FormField";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingState, EmptyState, ErrorState } from "@/components/StateViews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Info,
  Loader2,
} from "lucide-react";

// ============================================================================
// DATOS TEMPORALES CLARAMENTE MARCADOS (Fallback si endpoints de Juan no existen)
// ============================================================================
const DATOS_TEMPORALES_PRUEBAS: Prueba[] = [
  {
    id: 1,
    nombre: "Evaluación de usabilidad Portal Web v1.0",
    producto_evaluado: "Portal Web",
    fecha: "2026-03-15",
    estado: "en_curso",
  },
  {
    id: 2,
    nombre: "Prueba de usabilidad App Móvil v2.2",
    producto_evaluado: "App Móvil iOS/Android",
    fecha: "2026-03-20",
    estado: "planificada",
  },
  {
    id: 3,
    nombre: "Test de navegación Módulo de Pagos",
    producto_evaluado: "Pasarela de Pagos",
    fecha: "2026-03-25",
    estado: "finalizada",
  },
];

const DATOS_TEMPORALES_TAREAS: Tarea[] = [
  {
    id: 1,
    prueba_id: 1,
    titulo: "Registro de nuevo usuario e inicio de sesión",
    descripcion: "Completar el flujo de onboarding",
  },
  {
    id: 2,
    prueba_id: 1,
    titulo: "Búsqueda y filtrado de productos en catálogo",
    descripcion: "Encontrar un producto con filtros avanzados",
  },
  {
    id: 3,
    prueba_id: 1,
    titulo: "Proceso de checkout y confirmación de compra",
    descripcion: "Realizar el pago de un producto en el carrito",
  },
  {
    id: 4,
    prueba_id: 2,
    titulo: "Autenticación biométrica con huella o FaceID",
    descripcion: "Iniciar sesión usando datos biométricos",
  },
  {
    id: 5,
    prueba_id: 2,
    titulo: "Transferencia rápida a contactos frecuentes",
    descripcion: "Enviar dinero a un contacto de la agenda",
  },
  {
    id: 6,
    prueba_id: 3,
    titulo: "Configuración de tarjeta de crédito preferida",
    descripcion: "Asociar una nueva tarjeta y marcarla como favorita",
  },
];

const DATOS_TEMPORALES_PARTICIPANTES: Participante[] = [
  {
    id: 1,
    nombre: "Carlos Morales",
    edad: 28,
    ocupacion: "Diseñador Gráfico",
    experiencia: "media",
    email: "carlos.morales@ejemplo.com",
  },
  {
    id: 2,
    nombre: "Lucía Fernández",
    edad: 34,
    ocupacion: "Analista Contable",
    experiencia: "alta",
    email: "lucia.fernandez@ejemplo.com",
  },
  {
    id: 3,
    nombre: "Martín Rivas",
    edad: 45,
    ocupacion: "Comerciante",
    experiencia: "baja",
    email: "martin.rivas@ejemplo.com",
  },
];

interface FormObservacionState {
  prueba_id: string;
  tarea_id: string;
  participante_id: string;
  descripcion: string;
  completada: boolean;
  tiempo_seg: string;
  errores: string;
}

const INITIAL_FORM: FormObservacionState = {
  prueba_id: "",
  tarea_id: "",
  participante_id: "",
  descripcion: "",
  completada: false,
  tiempo_seg: "",
  errores: "0",
};

export default function ObservacionesPage() {
  // Estados principales de datos
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro por prueba
  const [filtroPruebaId, setFiltroPruebaId] = useState<string>("");

  // Catálogos para selects
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [usandoDatosTemporales, setUsandoDatosTemporales] = useState(false);

  // Estados de diálogo de formulario (Nuevo / Editar)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Observacion | null>(null);
  const [formData, setFormData] = useState<FormObservacionState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Estados de diálogo de confirmación para eliminar
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Observacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Clave para disparar recarga de datos
  const [refreshKey, setRefreshKey] = useState(0);

  const recargarObservaciones = useCallback(() => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // --------------------------------------------------------------------------
  // Carga de catálogos (Pruebas, Tareas, Participantes)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.get<Prueba[]>("/pruebas"),
      api.get<Tarea[]>("/tareas"),
      api.get<Participante[]>("/participantes"),
    ]).then(([resPruebas, resTareas, resPart]) => {
      if (cancelled) return;
      let fallo = false;

      if (
        resPruebas.status === "fulfilled" &&
        Array.isArray(resPruebas.value) &&
        resPruebas.value.length > 0
      ) {
        setPruebas(resPruebas.value);
      } else {
        fallo = true;
        setPruebas(DATOS_TEMPORALES_PRUEBAS);
      }

      if (
        resTareas.status === "fulfilled" &&
        Array.isArray(resTareas.value) &&
        resTareas.value.length > 0
      ) {
        setTareas(resTareas.value);
      } else {
        fallo = true;
        setTareas(DATOS_TEMPORALES_TAREAS);
      }

      if (
        resPart.status === "fulfilled" &&
        Array.isArray(resPart.value) &&
        resPart.value.length > 0
      ) {
        setParticipantes(resPart.value);
      } else {
        fallo = true;
        setParticipantes(DATOS_TEMPORALES_PARTICIPANTES);
      }

      setUsandoDatosTemporales(fallo);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Carga de Observaciones
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const query = filtroPruebaId ? `?prueba_id=${encodeURIComponent(filtroPruebaId)}` : "";

    api
      .get<Observacion[]>(`/observaciones${query}`)
      .then((data) => {
        if (!cancelled) {
          setObservaciones(Array.isArray(data) ? data : []);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Error al cargar las observaciones";
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filtroPruebaId, refreshKey]);

  // --------------------------------------------------------------------------
  // Tareas filtradas dinámicamente según la prueba seleccionada en el formulario
  // --------------------------------------------------------------------------
  const tareasDisponibles = useMemo(() => {
    if (!formData.prueba_id) return [];
    return tareas.filter((t) => t.prueba_id === Number(formData.prueba_id));
  }, [tareas, formData.prueba_id]);

  // Cambio de prueba en el formulario: reinicia la tarea seleccionada
  const handlePruebaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaPruebaId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      prueba_id: nuevaPruebaId,
      tarea_id: "", // Se reinicia si cambia la prueba según requerimiento
    }));

    if (formErrors.prueba_id) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.prueba_id;
        return next;
      });
    }
  };

  // --------------------------------------------------------------------------
  // Abrir modal de Nuevo o Editar
  // --------------------------------------------------------------------------
  const handleOpenNuevo = () => {
    setEditingItem(null);
    setFormData({
      ...INITIAL_FORM,
      prueba_id: filtroPruebaId || "",
    });
    setFormErrors({});
    setBackendError(null);
    setDialogOpen(true);
  };

  const handleOpenEditar = (obs: Observacion) => {
    setEditingItem(obs);
    setFormData({
      prueba_id: String(obs.prueba_id),
      tarea_id: String(obs.tarea_id),
      participante_id: String(obs.participante_id),
      descripcion: obs.descripcion || "",
      completada: Boolean(obs.completada),
      tiempo_seg:
        obs.tiempo_seg !== null && obs.tiempo_seg !== undefined
          ? String(obs.tiempo_seg)
          : "",
      errores:
        obs.errores !== null && obs.errores !== undefined
          ? String(obs.errores)
          : "0",
    });
    setFormErrors({});
    setBackendError(null);
    setDialogOpen(true);
  };

  // --------------------------------------------------------------------------
  // Validación por campo antes de enviar
  // --------------------------------------------------------------------------
  const validarFormulario = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.prueba_id) {
      errors.prueba_id = "Debes seleccionar una prueba";
    }

    if (!formData.tarea_id) {
      errors.tarea_id = "Debes seleccionar una tarea";
    }

    if (!formData.participante_id) {
      errors.participante_id = "Debes seleccionar un participante";
    }

    if (!formData.descripcion || !formData.descripcion.trim()) {
      errors.descripcion = "La descripción de la observación es obligatoria";
    }

    if (formData.tiempo_seg !== "") {
      const t = Number(formData.tiempo_seg);
      if (isNaN(t) || !Number.isInteger(t) || t < 0) {
        errors.tiempo_seg = "El tiempo debe ser un número entero mayor o igual a 0";
      }
    }

    if (formData.errores !== "") {
      const err = Number(formData.errores);
      if (isNaN(err) || !Number.isInteger(err) || err < 0) {
        errors.errores = "La cantidad de errores debe ser un entero mayor o igual a 0";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --------------------------------------------------------------------------
  // Guardar (Crear o Actualizar)
  // --------------------------------------------------------------------------
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);

    if (!validarFormulario()) {
      toast.error("Por favor completa los campos requeridos correctamente");
      return;
    }

    setSaving(true);
    const payload = {
      prueba_id: Number(formData.prueba_id),
      tarea_id: Number(formData.tarea_id),
      participante_id: Number(formData.participante_id),
      descripcion: formData.descripcion.trim(),
      completada: formData.completada,
      tiempo_seg: formData.tiempo_seg !== "" ? Number(formData.tiempo_seg) : null,
      errores: formData.errores !== "" ? Number(formData.errores) : 0,
    };

    try {
      if (editingItem) {
        await api.put(`/observaciones/${editingItem.id}`, payload);
        toast.success("Observación actualizada exitosamente");
      } else {
        await api.post("/observaciones", payload);
        toast.success("Observación creada exitosamente");
      }
      setDialogOpen(false);
      recargarObservaciones();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la solicitud";
      setBackendError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Eliminar
  // --------------------------------------------------------------------------
  const handleOpenEliminar = (obs: Observacion) => {
    setDeletingItem(obs);
    setDeleteDialogOpen(true);
  };

  const handleConfirmEliminar = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await api.del(`/observaciones/${deletingItem.id}`);
      toast.success("Observación eliminada exitosamente");
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      recargarObservaciones();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo eliminar la observación";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Definición de columnas para DataTable
  // --------------------------------------------------------------------------
  const columns: Column<Observacion>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-[60px] font-mono text-xs text-muted-foreground",
    },
    {
      key: "prueba_nombre",
      header: "Prueba",
      className: "min-w-[180px]",
      render: (item: Observacion) => (
        <span className="font-medium text-foreground">
          {item.prueba_nombre ?? `Prueba #${item.prueba_id}`}
        </span>
      ),
    },
    {
      key: "tarea_nombre",
      header: "Tarea",
      className: "min-w-[180px]",
      render: (item: Observacion) => (
        <span className="text-sm text-foreground/90">
          {item.tarea_nombre ?? `Tarea #${item.tarea_id}`}
        </span>
      ),
    },
    {
      key: "participante_nombre",
      header: "Participante",
      className: "min-w-[150px]",
      render: (item: Observacion) => (
        <span className="text-sm font-medium text-foreground/80">
          {item.participante_nombre ?? `Participante #${item.participante_id}`}
        </span>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      className: "min-w-[220px] max-w-[340px]",
      render: (item: Observacion) => (
        <p className="line-clamp-2 text-xs text-muted-foreground" title={item.descripcion}>
          {item.descripcion}
        </p>
      ),
    },
    {
      key: "completada",
      header: "Completada",
      className: "w-[110px] text-center",
      render: (item: Observacion) =>
        item.completada ? (
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20"
          >
            <CheckCircle2 className="size-3" />
            <span>Sí</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 text-muted-foreground border-border"
          >
            <XCircle className="size-3 text-red-500/80" />
            <span>No</span>
          </Badge>
        ),
    },
    {
      key: "tiempo_seg",
      header: "Tiempo",
      className: "w-[90px] text-right font-mono text-xs",
      render: (item: Observacion) =>
        item.tiempo_seg !== null && item.tiempo_seg !== undefined ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3" />
            {item.tiempo_seg}s
          </span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        ),
    },
    {
      key: "errores",
      header: "Errores",
      className: "w-[80px] text-center",
      render: (item: Observacion) =>
        item.errores > 0 ? (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
            <AlertTriangle className="size-3" />
            {item.errores}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">0</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Observaciones de Usabilidad
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro detallado del comportamiento, dificultades y desempeño de los participantes en cada tarea.
          </p>
        </div>
        <Button onClick={handleOpenNuevo} className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <Plus className="size-4" />
          <span>Nueva Observación</span>
        </Button>
      </div>

      {/* Aviso de datos temporales si aplica */}
      {usandoDatosTemporales && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Info className="size-4 shrink-0" />
          <p className="text-xs sm:text-sm">
            <strong>Modo con datos temporales:</strong> Los endpoints de catálogo (<code>/pruebas</code>, <code>/tareas</code>, <code>/participantes</code>) aún no están expuestos en el backend de Juan. Se están usando datos de demostración en los selectores.
          </p>
        </div>
      )}

      {/* Barra de Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="size-4 text-muted-foreground" />
          <span>Filtrar por prueba:</span>
        </div>
        <select
          value={filtroPruebaId}
          onChange={(e) => setFiltroPruebaId(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20 max-w-xs cursor-pointer"
        >
          <option value="">Todas las pruebas</option>
          {pruebas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        {filtroPruebaId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltroPruebaId("")}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 cursor-pointer"
          >
            Limpiar filtro
          </Button>
        )}
      </div>

      {/* Contenido principal según estado */}
      {loading ? (
        <LoadingState message="Cargando observaciones..." />
      ) : error ? (
        <ErrorState
          title="Error al cargar las observaciones"
          message={error}
          onRetry={recargarObservaciones}
          retryText="Reintentar carga"
        />
      ) : observaciones.length === 0 ? (
        <EmptyState
          title="No hay observaciones registradas"
          description={
            filtroPruebaId
              ? "No se encontraron observaciones para la prueba seleccionada."
              : "Comienza registrando la primera observación del estudio de usabilidad."
          }
          icon={<FileText className="size-8" />}
          action={
            <Button onClick={handleOpenNuevo} size="sm" className="mt-2 cursor-pointer">
              <Plus className="size-4 mr-1.5" />
              Crear primera observación
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={observaciones}
          onEdit={handleOpenEditar}
          onDelete={handleOpenEliminar}
          emptyMessage="No se encontraron observaciones con los criterios aplicados."
        />
      )}

      {/* Diálogo Modal de Formulario: Crear / Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Observación" : "Nueva Observación"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Actualiza los datos de la observación #${editingItem.id}`
                : "Completa los datos de la observación registrada durante la prueba."}
            </DialogDescription>
          </DialogHeader>

          {/* Mensaje de error retornado por backend */}
          {backendError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-center gap-2"
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{backendError}</span>
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-4 py-2">
            {/* 1. Selector de Prueba */}
            <FormField
              label="Prueba"
              htmlFor="form-prueba"
              required
              error={formErrors.prueba_id}
            >
              <select
                id="form-prueba"
                value={formData.prueba_id}
                onChange={handlePruebaChange}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Selecciona una prueba --</option>
                {pruebas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </FormField>

            {/* 2. Selector de Tarea (filtrada por la prueba elegida) */}
            <FormField
              label="Tarea evaluada"
              htmlFor="form-tarea"
              required
              error={formErrors.tarea_id}
            >
              <select
                id="form-tarea"
                value={formData.tarea_id}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, tarea_id: e.target.value }));
                  if (formErrors.tarea_id) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.tarea_id;
                      return next;
                    });
                  }
                }}
                disabled={!formData.prueba_id}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted/50"
              >
                <option value="">
                  {!formData.prueba_id
                    ? "-- Primero selecciona una prueba --"
                    : tareasDisponibles.length === 0
                    ? "-- No hay tareas registradas para esta prueba --"
                    : "-- Selecciona una tarea --"}
                </option>
                {tareasDisponibles.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo}
                  </option>
                ))}
              </select>
            </FormField>

            {/* 3. Selector de Participante */}
            <FormField
              label="Participante"
              htmlFor="form-participante"
              required
              error={formErrors.participante_id}
            >
              <select
                id="form-participante"
                value={formData.participante_id}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, participante_id: e.target.value }));
                  if (formErrors.participante_id) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.participante_id;
                      return next;
                    });
                  }
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Selecciona un participante --</option>
                {participantes.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.nombre} ({part.experiencia})
                  </option>
                ))}
              </select>
            </FormField>

            {/* 4. Descripción */}
            <FormField
              label="Descripción de la observación"
              htmlFor="form-descripcion"
              required
              error={formErrors.descripcion}
            >
              <Textarea
                id="form-descripcion"
                value={formData.descripcion}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, descripcion: e.target.value }));
                  if (formErrors.descripcion) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.descripcion;
                      return next;
                    });
                  }
                }}
                placeholder="Describe lo que ocurrió: dudas, comentarios o dificultades del participante..."
                rows={3}
              />
            </FormField>

            {/* 5. Casilla Completada */}
            <div className="flex items-center gap-2.5 rounded-lg border border-input/60 p-3 bg-muted/20">
              <input
                type="checkbox"
                id="form-completada"
                checked={formData.completada}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, completada: e.target.checked }))
                }
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="form-completada" className="text-sm font-medium text-foreground cursor-pointer select-none">
                ¿La tarea fue completada exitosamente?
              </label>
            </div>

            {/* 6. Campos Numéricos: Tiempo y Errores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Tiempo empleado (segundos)"
                htmlFor="form-tiempo"
                error={formErrors.tiempo_seg}
              >
                <Input
                  id="form-tiempo"
                  type="number"
                  min="0"
                  placeholder="Ej. 45 (opcional)"
                  value={formData.tiempo_seg}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tiempo_seg: e.target.value }))
                  }
                />
              </FormField>

              <FormField
                label="Cantidad de errores"
                htmlFor="form-errores"
                error={formErrors.errores}
              >
                <Input
                  id="form-errores"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.errores}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, errores: e.target.value }))
                  }
                />
              </FormField>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingItem ? "Actualizar Observación" : "Crear Observación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Modal de Confirmación: Eliminar */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmEliminar}
        title="¿Eliminar observación?"
        description={
          deletingItem
            ? `Se eliminará la observación #${deletingItem.id} de manera permanente. Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
        confirmText="Eliminar permanentemente"
        loading={deleting}
      />
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "@/lib/api";
import { Hallazgo, Prueba, Observacion, Severidad, EstadoHallazgo } from "@/types";
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
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Flame,
  Clock,
  CheckCircle2,
  RefreshCw,
  Info,
  Loader2,
  BookmarkCheck,
} from "lucide-react";

// ============================================================================
// DATOS TEMPORALES CLARAMENTE MARCADOS (Fallback si endpoints no existen aún)
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

const DATOS_TEMPORALES_OBSERVACIONES: Observacion[] = [
  {
    id: 1,
    prueba_id: 1,
    tarea_id: 1,
    participante_id: 1,
    descripcion: "El botón de registro pasa desapercibido por el contraste de color.",
    completada: true,
    errores: 1,
  },
  {
    id: 2,
    prueba_id: 1,
    tarea_id: 2,
    participante_id: 2,
    descripcion: "El usuario intentó filtrar por precio pero el dropdown no respondió al primer clic.",
    completada: false,
    errores: 3,
  },
  {
    id: 3,
    prueba_id: 2,
    tarea_id: 4,
    participante_id: 1,
    descripcion: "Fallo inesperado al activar la autenticación biométrica en Android 14.",
    completada: false,
    errores: 2,
  },
];

interface FormHallazgoState {
  prueba_id: string;
  observacion_id: string;
  titulo: string;
  descripcion: string;
  severidad: Severidad;
  frecuencia: string;
  recomendacion: string;
  estado: EstadoHallazgo;
}

const INITIAL_FORM: FormHallazgoState = {
  prueba_id: "",
  observacion_id: "",
  titulo: "",
  descripcion: "",
  severidad: "menor",
  frecuencia: "1",
  recomendacion: "",
  estado: "abierto",
};

export default function HallazgosPage() {
  // Estados principales de datos
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroPruebaId, setFiltroPruebaId] = useState<string>("");
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>("");

  // Catálogos para selects
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [usandoDatosTemporales, setUsandoDatosTemporales] = useState(false);

  // Estados de diálogo de formulario (Nuevo / Editar)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Hallazgo | null>(null);
  const [formData, setFormData] = useState<FormHallazgoState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Estados de diálogo de confirmación para eliminar
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Hallazgo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Clave para disparar recarga de datos
  const [refreshKey, setRefreshKey] = useState(0);

  const recargarHallazgos = useCallback(() => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // --------------------------------------------------------------------------
  // Carga de catálogos (Pruebas y Observaciones)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.get<Prueba[]>("/pruebas"),
      api.get<Observacion[]>("/observaciones"),
    ]).then(([resPruebas, resObs]) => {
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
        resObs.status === "fulfilled" &&
        Array.isArray(resObs.value) &&
        resObs.value.length > 0
      ) {
        setObservaciones(resObs.value);
      } else {
        fallo = true;
        setObservaciones(DATOS_TEMPORALES_OBSERVACIONES);
      }

      setUsandoDatosTemporales(fallo);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Carga de Hallazgos con filtros opcionales (?prueba_id= & ?severidad=)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (filtroPruebaId) params.append("prueba_id", filtroPruebaId);
    if (filtroSeveridad) params.append("severidad", filtroSeveridad);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    api
      .get<Hallazgo[]>(`/hallazgos${queryString}`)
      .then((data) => {
        if (!cancelled) {
          setHallazgos(Array.isArray(data) ? data : []);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Error al cargar los hallazgos";
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filtroPruebaId, filtroSeveridad, refreshKey]);

  // --------------------------------------------------------------------------
  // Observaciones filtradas dinámicamente según la prueba seleccionada
  // --------------------------------------------------------------------------
  const observacionesDisponibles = useMemo(() => {
    if (!formData.prueba_id) return [];
    return observaciones.filter((o) => o.prueba_id === Number(formData.prueba_id));
  }, [observaciones, formData.prueba_id]);

  // Cambio de prueba en el formulario: reinicia la observación seleccionada
  const handlePruebaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaPruebaId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      prueba_id: nuevaPruebaId,
      observacion_id: "", // Se reinicia al cambiar la prueba según requerimiento
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

  const handleOpenEditar = (item: Hallazgo) => {
    setEditingItem(item);
    setFormData({
      prueba_id: String(item.prueba_id),
      observacion_id:
        item.observacion_id !== null && item.observacion_id !== undefined
          ? String(item.observacion_id)
          : "",
      titulo: item.titulo || "",
      descripcion: item.descripcion || "",
      severidad: item.severidad,
      frecuencia: String(item.frecuencia ?? 1),
      recomendacion: item.recomendacion || "",
      estado: item.estado,
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

    if (!formData.titulo || !formData.titulo.trim()) {
      errors.titulo = "El título del hallazgo es obligatorio";
    }

    if (!formData.severidad) {
      errors.severidad = "Debes seleccionar la severidad";
    }

    const freq = Number(formData.frecuencia);
    if (isNaN(freq) || !Number.isInteger(freq) || freq < 1) {
      errors.frecuencia = "La frecuencia debe ser un número entero mayor o igual a 1";
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
      observacion_id:
        formData.observacion_id !== "" ? Number(formData.observacion_id) : null,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || null,
      severidad: formData.severidad,
      frecuencia: Number(formData.frecuencia) || 1,
      recomendacion: formData.recomendacion.trim() || null,
      estado: formData.estado,
    };

    try {
      if (editingItem) {
        await api.put(`/hallazgos/${editingItem.id}`, payload);
        toast.success("Hallazgo actualizado exitosamente");
      } else {
        await api.post("/hallazgos", payload);
        toast.success("Hallazgo registrado exitosamente");
      }
      setDialogOpen(false);
      recargarHallazgos();
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
  const handleOpenEliminar = (item: Hallazgo) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmEliminar = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await api.del(`/hallazgos/${deletingItem.id}`);
      toast.success("Hallazgo eliminado exitosamente");
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      recargarHallazgos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo eliminar el hallazgo";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helper para renderizar badges de severidad y estado con colores distintos
  // --------------------------------------------------------------------------
  const renderSeveridadBadge = (severidad: Severidad) => {
    switch (severidad) {
      case "cosmetica":
        return (
          <Badge
            variant="outline"
            className="bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30 gap-1"
          >
            <ShieldAlert className="size-3" />
            <span>Cosmética</span>
          </Badge>
        );
      case "menor":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 gap-1 font-medium"
          >
            <AlertCircle className="size-3 text-amber-600" />
            <span>Menor</span>
          </Badge>
        );
      case "mayor":
        return (
          <Badge
            variant="outline"
            className="bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30 gap-1 font-semibold"
          >
            <AlertTriangle className="size-3 text-orange-600" />
            <span>Mayor</span>
          </Badge>
        );
      case "catastrofica":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1 font-bold animate-pulse"
          >
            <Flame className="size-3 text-red-600" />
            <span>Catastrófica</span>
          </Badge>
        );
    }
  };

  const renderEstadoBadge = (estado: EstadoHallazgo) => {
    switch (estado) {
      case "abierto":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1"
          >
            <Clock className="size-3" />
            <span>Abierto</span>
          </Badge>
        );
      case "en_correccion":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1"
          >
            <RefreshCw className="size-3" />
            <span>En corrección</span>
          </Badge>
        );
      case "resuelto":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
          >
            <CheckCircle2 className="size-3" />
            <span>Resuelto</span>
          </Badge>
        );
    }
  };

  // --------------------------------------------------------------------------
  // Columnas para DataTable
  // --------------------------------------------------------------------------
  const columns: Column<Hallazgo>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-[60px] font-mono text-xs text-muted-foreground",
    },
    {
      key: "prueba_nombre",
      header: "Prueba",
      className: "min-w-[170px]",
      render: (item: Hallazgo) => (
        <span className="font-medium text-foreground">
          {item.prueba_nombre ?? `Prueba #${item.prueba_id}`}
        </span>
      ),
    },
    {
      key: "titulo",
      header: "Título del Hallazgo",
      className: "min-w-[200px] max-w-[280px]",
      render: (item: Hallazgo) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-foreground line-clamp-1" title={item.titulo}>
            {item.titulo}
          </p>
          {item.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-1" title={item.descripcion}>
              {item.descripcion}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "severidad",
      header: "Severidad",
      className: "w-[130px]",
      render: (item: Hallazgo) => renderSeveridadBadge(item.severidad),
    },
    {
      key: "frecuencia",
      header: "Frecuencia",
      className: "w-[90px] text-center font-mono text-xs",
      render: (item: Hallazgo) => (
        <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
          {item.frecuencia}x
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      className: "w-[140px]",
      render: (item: Hallazgo) => renderEstadoBadge(item.estado),
    },
    {
      key: "observacion_id",
      header: "Observación vinculada",
      className: "min-w-[180px] max-w-[220px]",
      render: (item: Hallazgo) =>
        item.observacion_id ? (
          <span
            className="text-xs text-muted-foreground line-clamp-1 font-mono"
            title={item.observacion_descripcion ?? `Obs #${item.observacion_id}`}
          >
            #{item.observacion_id}: {item.observacion_descripcion ?? "Observación vinculada"}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">Sin observación</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hallazgos de Usabilidad
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Problemas, fricciones y oportunidades de mejora identificados durante las pruebas con participantes.
          </p>
        </div>
        <Button onClick={handleOpenNuevo} className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <Plus className="size-4" />
          <span>Nuevo Hallazgo</span>
        </Button>
      </div>

      {/* Aviso de datos temporales si aplica */}
      {usandoDatosTemporales && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Info className="size-4 shrink-0" />
          <p className="text-xs sm:text-sm">
            <strong>Modo con datos temporales:</strong> Algunos catálogos aún no están expuestos en el backend. Se están usando datos de demostración para selectores.
          </p>
        </div>
      )}

      {/* Barra de Filtros: Prueba y Severidad */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="size-4 text-muted-foreground" />
          <span>Filtros:</span>
        </div>

        {/* Filtro por Prueba */}
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

        {/* Filtro por Severidad */}
        <select
          value={filtroSeveridad}
          onChange={(e) => setFiltroSeveridad(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20 max-w-xs cursor-pointer"
        >
          <option value="">Todas las severidades</option>
          <option value="cosmetica">Cosmética</option>
          <option value="menor">Menor</option>
          <option value="mayor">Mayor</option>
          <option value="catastrofica">Catastrófica</option>
        </select>

        {(filtroPruebaId || filtroSeveridad) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFiltroPruebaId("");
              setFiltroSeveridad("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 cursor-pointer"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Contenido principal según estado */}
      {loading ? (
        <LoadingState message="Cargando hallazgos..." />
      ) : error ? (
        <ErrorState
          title="Error al cargar los hallazgos"
          message={error}
          onRetry={recargarHallazgos}
          retryText="Reintentar carga"
        />
      ) : hallazgos.length === 0 ? (
        <EmptyState
          title="No hay hallazgos registrados"
          description={
            filtroPruebaId || filtroSeveridad
              ? "No se encontraron hallazgos con los filtros seleccionados."
              : "Registra los problemas y oportunidades identificados en las pruebas de usabilidad."
          }
          icon={<BookmarkCheck className="size-8" />}
          action={
            <Button onClick={handleOpenNuevo} size="sm" className="mt-2 cursor-pointer">
              <Plus className="size-4 mr-1.5" />
              Crear primer hallazgo
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={hallazgos}
          onEdit={handleOpenEditar}
          onDelete={handleOpenEliminar}
          emptyMessage="No se encontraron hallazgos con los criterios especificados."
        />
      )}

      {/* Diálogo Modal de Formulario: Crear / Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Hallazgo" : "Nuevo Hallazgo"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Actualiza la información del hallazgo #${editingItem.id}`
                : "Registra un hallazgo o problema detectado durante el estudio."}
            </DialogDescription>
          </DialogHeader>

          {/* Banner de error de backend */}
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

            {/* 2. Selector de Observación (opcional, filtrada por la prueba) */}
            <FormField
              label="Observación asociada (opcional)"
              htmlFor="form-observacion"
              error={formErrors.observacion_id}
            >
              <select
                id="form-observacion"
                value={formData.observacion_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, observacion_id: e.target.value }))
                }
                disabled={!formData.prueba_id}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted/50"
              >
                <option value="">-- Sin observación asociada --</option>
                {observacionesDisponibles.map((obs) => (
                  <option key={obs.id} value={obs.id}>
                    Obs #{obs.id}: {obs.descripcion.slice(0, 70)}...
                  </option>
                ))}
              </select>
            </FormField>

            {/* 3. Título del Hallazgo */}
            <FormField
              label="Título del hallazgo"
              htmlFor="form-titulo"
              required
              error={formErrors.titulo}
            >
              <Input
                id="form-titulo"
                placeholder="Ej. El usuario no encuentra el botón de finalizar compra"
                value={formData.titulo}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, titulo: e.target.value }));
                  if (formErrors.titulo) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.titulo;
                      return next;
                    });
                  }
                }}
              />
            </FormField>

            {/* 4. Severidad, Estado y Frecuencia */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                label="Severidad"
                htmlFor="form-severidad"
                required
                error={formErrors.severidad}
              >
                <select
                  id="form-severidad"
                  value={formData.severidad}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      severidad: e.target.value as Severidad,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="cosmetica">Cosmética</option>
                  <option value="menor">Menor</option>
                  <option value="mayor">Mayor</option>
                  <option value="catastrofica">Catastrófica</option>
                </select>
              </FormField>

              <FormField label="Estado" htmlFor="form-estado">
                <select
                  id="form-estado"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estado: e.target.value as EstadoHallazgo,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_correccion">En corrección</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </FormField>

              <FormField
                label="Frecuencia"
                htmlFor="form-frecuencia"
                error={formErrors.frecuencia}
              >
                <Input
                  id="form-frecuencia"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.frecuencia}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, frecuencia: e.target.value }))
                  }
                />
              </FormField>
            </div>

            {/* 5. Descripción */}
            <FormField
              label="Descripción detallada"
              htmlFor="form-descripcion"
            >
              <Textarea
                id="form-descripcion"
                rows={3}
                placeholder="Describe el contexto del problema, comportamiento del participante y patrones..."
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
                }
              />
            </FormField>

            {/* 6. Recomendación */}
            <FormField
              label="Recomendación de mejora"
              htmlFor="form-recomendacion"
            >
              <Textarea
                id="form-recomendacion"
                rows={2}
                placeholder="Propuesta de solución de diseño o técnica para mitigar este hallazgo..."
                value={formData.recomendacion}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, recomendacion: e.target.value }))
                }
              />
            </FormField>

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
                {editingItem ? "Actualizar Hallazgo" : "Crear Hallazgo"}
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
        title="¿Eliminar hallazgo?"
        description={
          deletingItem
            ? `Se eliminará el hallazgo "${deletingItem.titulo}" (#${deletingItem.id}) de manera permanente.`
            : "Esta acción no se puede deshacer."
        }
        confirmText="Eliminar permanentemente"
        loading={deleting}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/DataTable";
import { FormField } from "@/components/FormField";
import { LoadingState, EmptyState, ErrorState } from "@/components/StateViews";
import { api } from "@/lib/api";
import type { PlanPrueba, Prueba } from "@/types";

interface FormErrors {
  prueba_id?: string;
  metodo?: string;
  general?: string;
}

export default function PlanPage() {
  const [planes, setPlanes] = useState<PlanPrueba[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del modal de formulario
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [planEditandoId, setPlanEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Campos del formulario
  const [pruebaId, setPruebaId] = useState("");
  const [metodo, setMetodo] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [perfilUsuarios, setPerfilUsuarios] = useState("");
  const [tareasPlan, setTareasPlan] = useState("");
  const [metricas, setMetricas] = useState("");
  const [guionModeracion, setGuionModeracion] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [planesData, pruebasData] = await Promise.all([
        api.get<PlanPrueba[]>("/plan"),
        api.get<Prueba[]>("/pruebas").catch(() => [] as Prueba[]),
      ]);
      setPlanes(planesData);
      setPruebas(pruebasData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los planes de prueba"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setPruebaId("");
    setMetodo("");
    setObjetivos("");
    setPerfilUsuarios("");
    setTareasPlan("");
    setMetricas("");
    setGuionModeracion("");
    setErrors({});
    setPlanEditandoId(null);
  };

  const handleNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setDialogOpen(true);
  };

  const handleEditar = (plan: PlanPrueba) => {
    limpiarFormulario();
    setModoEdicion(true);
    setPlanEditandoId(plan.id);
    setPruebaId(String(plan.prueba_id));
    setMetodo(plan.metodo ?? "");
    setObjetivos(plan.objetivos ?? "");
    setPerfilUsuarios(plan.perfil_usuarios ?? "");
    setTareasPlan(plan.tareas_plan ?? "");
    setMetricas(plan.metricas ?? "");
    setGuionModeracion(plan.guion_moderacion ?? "");
    setDialogOpen(true);
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: FormErrors = {};

    if (!pruebaId || Number(pruebaId) <= 0) {
      nuevosErrores.prueba_id = "Debes seleccionar una prueba asociada";
    }

    if (metodo && metodo.length > 100) {
      nuevosErrores.metodo = "El método no puede exceder los 100 caracteres";
    }

    const camposTexto = [
      objetivos,
      perfilUsuarios,
      metodo,
      tareasPlan,
      metricas,
      guionModeracion,
    ];
    const tieneContenido = camposTexto.some((c) => c.trim().length > 0);

    if (!tieneContenido) {
      nuevosErrores.general =
        "Al menos uno de los campos de contenido (objetivos, perfil de usuarios, método, tareas del plan, métricas o guion de moderación) debe contener texto.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    const payload = {
      prueba_id: Number(pruebaId),
      metodo: metodo.trim() || null,
      objetivos: objetivos.trim() || null,
      perfil_usuarios: perfilUsuarios.trim() || null,
      tareas_plan: tareasPlan.trim() || null,
      metricas: metricas.trim() || null,
      guion_moderacion: guionModeracion.trim() || null,
    };

    try {
      setGuardando(true);
      if (modoEdicion && planEditandoId) {
        await api.put(`/plan/${planEditandoId}`, payload);
        toast.success("Plan de pruebas actualizado con éxito");
      } else {
        await api.post("/plan", payload);
        toast.success("Plan de pruebas creado con éxito");
      }
      setDialogOpen(false);
      limpiarFormulario();
      cargarDatos();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al guardar el plan";
      toast.error(msg);
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setGuardando(false);
    }
  };

  const columns: Column<PlanPrueba>[] = [
    {
      key: "prueba_nombre",
      header: "Prueba",
      render: (plan) => (
        <span className="font-medium text-foreground">
          {plan.prueba_nombre || `Prueba #${plan.prueba_id}`}
        </span>
      ),
    },
    {
      key: "metodo",
      header: "Método",
      render: (plan) => (
        <span className="text-muted-foreground">
          {plan.metodo ? plan.metodo : "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Fecha de creación",
      render: (plan) => (
        <span className="text-sm text-muted-foreground">
          {plan.created_at
            ? new Date(plan.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Planes de Prueba
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión y consulta de los planes de pruebas de usabilidad.
          </p>
        </div>
        <Button onClick={handleNuevo} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo plan
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Cargando planes de prueba..." />
      ) : error ? (
        <ErrorState
          title="Error al cargar planes"
          message={error}
          onRetry={cargarDatos}
        />
      ) : planes.length === 0 ? (
        <EmptyState
          title="No hay planes de prueba"
          description="Aún no se ha registrado ningún plan de pruebas en el sistema."
          action={
            <Button onClick={handleNuevo} variant="outline" className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo plan
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={planes}
          onEdit={handleEditar}
        />
      )}

      {/* Diálogo grande con formulario dividido en secciones */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar plan de pruebas" : "Nuevo plan de pruebas"}
            </DialogTitle>
            <DialogDescription>
              Completa las secciones del plan de usabilidad. Los cambios se guardarán vinculados a la prueba seleccionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            {errors.general && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                {errors.general}
              </div>
            )}

            {/* Sección 1: Información General y Método */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-muted-foreground">
                1. Configuración de la Prueba
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Prueba asociada"
                  htmlFor="prueba_id"
                  required
                  error={errors.prueba_id}
                >
                  <select
                    id="prueba_id"
                    value={pruebaId}
                    onChange={(e) => {
                      setPruebaId(e.target.value);
                      if (errors.prueba_id) {
                        setErrors((prev) => ({ ...prev, prueba_id: undefined }));
                      }
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- Selecciona una prueba --</option>
                    {pruebas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.producto_evaluado})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Método"
                  htmlFor="metodo"
                  error={errors.metodo}
                >
                  <Input
                    id="metodo"
                    placeholder="Ej. Prueba moderada sincrónica"
                    value={metodo}
                    maxLength={100}
                    onChange={(e) => {
                      setMetodo(e.target.value);
                      if (errors.metodo) {
                        setErrors((prev) => ({ ...prev, metodo: undefined }));
                      }
                    }}
                  />
                  <span className="text-[11px] text-muted-foreground text-right block">
                    {metodo.length}/100 caracteres
                  </span>
                </FormField>
              </div>
            </div>

            {/* Sección 2: Objetivos y Perfil de Usuarios */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-muted-foreground">
                2. Alcance y Participantes
              </h3>
              <div className="space-y-4">
                <FormField
                  label="Objetivos"
                  htmlFor="objetivos"
                >
                  <Textarea
                    id="objetivos"
                    rows={4}
                    placeholder="Describe los objetivos generales y específicos de la prueba de usabilidad..."
                    value={objetivos}
                    onChange={(e) => setObjetivos(e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Perfil de usuarios"
                  htmlFor="perfil_usuarios"
                >
                  <Textarea
                    id="perfil_usuarios"
                    rows={3}
                    placeholder="Define las características de los usuarios evaluadores (experiencia, edad, conocimientos)..."
                    value={perfilUsuarios}
                    onChange={(e) => setPerfilUsuarios(e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* Sección 3: Tareas del Plan y Métricas */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-muted-foreground">
                3. Tareas y Métricas de Evaluación
              </h3>
              <div className="space-y-4">
                <FormField
                  label="Tareas del plan"
                  htmlFor="tareas_plan"
                >
                  <Textarea
                    id="tareas_plan"
                    rows={4}
                    placeholder="Describe las tareas o escenarios principales que ejecutarán los participantes..."
                    value={tareasPlan}
                    onChange={(e) => setTareasPlan(e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Métricas"
                  htmlFor="metricas"
                >
                  <Textarea
                    id="metricas"
                    rows={3}
                    placeholder="Especifica métricas de éxito (tiempo de completitud, tasa de éxito, escala SUS, errores permitidos)..."
                    value={metricas}
                    onChange={(e) => setMetricas(e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* Sección 4: Guion de Moderación */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-muted-foreground">
                4. Guion de Moderación
              </h3>
              <FormField
                label="Guion de moderación"
                htmlFor="guion_moderacion"
              >
                <Textarea
                  id="guion_moderacion"
                  rows={5}
                  placeholder="Escribe la bienvenida, consentimiento informado, pautas para el moderador y preguntas de cierre..."
                  value={guionModeracion}
                  onChange={(e) => setGuionModeracion(e.target.value)}
                />
              </FormField>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : modoEdicion ? "Guardar cambios" : "Crear plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { LoadingState, EmptyState, ErrorState } from "@/components/StateViews";
import { api } from "@/lib/api";
import type { PlanPrueba } from "@/types";

export default function PlanPage() {
  const [planes, setPlanes] = useState<PlanPrueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<PlanPrueba[]>("/plan");
      setPlanes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los planes de prueba"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

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
        <Button
          onClick={() => {
            // El diálogo del formulario se integrará en el Bloque 3
          }}
          className="cursor-pointer"
        >
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
          onRetry={cargarPlanes}
        />
      ) : planes.length === 0 ? (
        <EmptyState
          title="No hay planes de prueba"
          description="Aún no se ha registrado ningún plan de pruebas en el sistema."
          action={
            <Button
              onClick={() => {
                // El diálogo del formulario se integrará en el Bloque 3
              }}
              variant="outline"
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo plan
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={planes} />
      )}
    </div>
  );
}

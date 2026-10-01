"use client";

import { useEffect, useState } from "react";
import {
  FlaskConical,
  Users,
  Eye,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardTables } from "@/components/DashboardTables";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { api } from "@/lib/api";
import type { DashboardResumen } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDashboard = () => {
    setLoading(true);
    setError(null);
    api
      .get<DashboardResumen>("/dashboard/resumen")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar el resumen del dashboard"
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancel = false;
    api
      .get<DashboardResumen>("/dashboard/resumen")
      .then((res) => {
        if (!cancel) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancel) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar el resumen del dashboard"
          );
          setLoading(false);
        }
      });

    return () => {
      cancel = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingState message="Cargando métricas del dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <ErrorState
          title="Error al cargar el Dashboard"
          message={error ?? "No se pudieron obtener los datos del servidor"}
          onRetry={cargarDashboard}
          retryText="Reintentar"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard de Usabilidad
        </h1>
        <p className="text-sm text-muted-foreground">
          Métricas consolidadas de pruebas, observaciones y hallazgos.
        </p>
      </div>

      {/* Tarjetas de Totales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pruebas */}
        <Card className="shadow-xs transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pruebas
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <FlaskConical className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {data.totales.pruebas}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pruebas de usabilidad planificadas o ejecutadas
            </p>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card className="shadow-xs transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participantes
            </CardTitle>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {data.totales.participantes}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Usuarios evaluadores registrados en pruebas
            </p>
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card className="shadow-xs transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Observaciones
            </CardTitle>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Eye className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {data.totales.observaciones}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Registros de comportamiento e interacción
            </p>
          </CardContent>
        </Card>

        {/* Hallazgos */}
        <Card className="shadow-xs transition-all hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hallazgos
            </CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {data.totales.hallazgos}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Problemas y oportunidades detectadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Severidad y Estado */}
      <DashboardCharts
        severidad={data.hallazgos_por_severidad}
        estado={data.hallazgos_por_estado}
      />

      {/* Tablas de Rendimiento por Tarea y Top Hallazgos */}
      <DashboardTables
        tareas={data.tareas}
        topHallazgos={data.top_hallazgos}
      />
    </div>
  );
}

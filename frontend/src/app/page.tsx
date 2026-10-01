"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  RotateCcw,
  FlaskConical,
  Users,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardResumenMock } from "@/lib/dashboard-mock";
import type { DashboardResumen } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDashboard = () => {
    setLoading(true);
    setError(null);
    getDashboardResumenMock()
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
    getDashboardResumenMock()
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
      <div
        className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Cargando métricas del dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20"
        role="alert"
      >
        <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/40 dark:text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-red-700 dark:text-red-400">
          Error al cargar el Dashboard
        </h3>
        <p className="mt-1 text-sm text-red-600/90 dark:text-red-300">
          {error ?? "No se recibieron datos"}
        </p>
        <Button
          onClick={cargarDashboard}
          variant="outline"
          className="mt-4 gap-2 cursor-pointer border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}

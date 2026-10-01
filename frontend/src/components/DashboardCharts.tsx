"use client";

import { useSyncExternalStore } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { BarChart3, PieChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSeveridad, DashboardEstado } from "@/types";

interface DashboardChartsProps {
  severidad: DashboardSeveridad;
  estado: DashboardEstado;
}

const emptySubscribe = () => () => {};

export function DashboardCharts({ severidad, estado }: DashboardChartsProps) {
  // Patrón estándar de React para renderizado seguro en cliente sin cascada de renders
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const totalSeveridad =
    severidad.cosmetica +
    severidad.menor +
    severidad.mayor +
    severidad.catastrofica;

  const totalEstado =
    estado.abierto + estado.en_correccion + estado.resuelto;

  const dataSeveridad = [
    { name: "Cosmética", cantidad: severidad.cosmetica, color: "#94a3b8" },
    { name: "Menor", cantidad: severidad.menor, color: "#eab308" },
    { name: "Mayor", cantidad: severidad.mayor, color: "#f97316" },
    { name: "Catastrófica", cantidad: severidad.catastrofica, color: "#ef4444" },
  ];

  const dataEstado = [
    { name: "Abierto", cantidad: estado.abierto, color: "#3b82f6" },
    { name: "En corrección", cantidad: estado.en_correccion, color: "#f59e0b" },
    { name: "Resuelto", cantidad: estado.resuelto, color: "#10b981" },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Hallazgos por Severidad
            </CardTitle>
            <CardDescription>Distribución según el impacto del problema</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-xs text-muted-foreground">
            Cargando gráfico...
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Hallazgos por Estado
            </CardTitle>
            <CardDescription>Progreso y resolución de incidencias</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-xs text-muted-foreground">
            Cargando gráfico...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Gráfico 1: Hallazgos por Severidad */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Hallazgos por Severidad</span>
          </CardTitle>
          <CardDescription>
            Distribución clasificada por nivel de severidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalSeveridad === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <PieChart className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">No hay hallazgos registrados</p>
              <p className="text-xs">Los datos aparecerán cuando se detecten hallazgos.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataSeveridad}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      color: "#0f172a",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [
                      `${value ?? 0} hallazgos`,
                      "Cantidad",
                    ]}
                  />
                  <Bar
                    dataKey="cantidad"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    {dataSeveridad.map((entry, index) => (
                      <Cell key={`cell-sev-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico 2: Hallazgos por Estado */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Hallazgos por Estado</span>
          </CardTitle>
          <CardDescription>
            Progreso en el flujo de corrección y cierre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalEstado === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <PieChart className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">No hay hallazgos registrados</p>
              <p className="text-xs">Los datos aparecerán cuando se asignen estados.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataEstado}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      color: "#0f172a",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [
                      `${value ?? 0} hallazgos`,
                      "Cantidad",
                    ]}
                  />
                  <Bar
                    dataKey="cantidad"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    {dataEstado.map((entry, index) => (
                      <Cell key={`cell-est-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

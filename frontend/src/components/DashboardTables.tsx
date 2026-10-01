import { Flame, Clock, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DashboardTarea, DashboardTopHallazgo, Severidad } from "@/types";

interface DashboardTablesProps {
  tareas: DashboardTarea[];
  topHallazgos: DashboardTopHallazgo[];
}

function formatTiempo(seg: number): string {
  if (seg <= 0) return "0 s";
  const mins = Math.floor(seg / 60);
  const restantes = Math.round(seg % 60);
  if (mins > 0 && restantes > 0) {
    return `${mins} min ${restantes} s`;
  }
  if (mins > 0) {
    return `${mins} min`;
  }
  return `${restantes} s`;
}

function getTasaExitoBadge(tasa: number) {
  if (tasa >= 80) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
        {tasa}%
      </Badge>
    );
  }
  if (tasa >= 50) {
    return (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
        {tasa}%
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/50">
      {tasa}%
    </Badge>
  );
}

function getSeveridadBadge(severidad: Severidad) {
  switch (severidad) {
    case "catastrofica":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/50 capitalize">
          Catastrófica
        </Badge>
      );
    case "mayor":
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50 capitalize">
          Mayor
        </Badge>
      );
    case "menor":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 capitalize">
          Menor
        </Badge>
      );
    case "cosmetica":
    default:
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
          Cosmética
        </Badge>
      );
  }
}

export function DashboardTables({ tareas, topHallazgos }: DashboardTablesProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Tabla de tareas (2 columnas de ancho en escritorio) */}
      <Card className="shadow-xs lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Rendimiento por Tarea</span>
          </CardTitle>
          <CardDescription>
            Efectividad (tasa de éxito), tiempo promedio y cantidad de errores registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tareas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay tareas evaluadas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Tarea</TableHead>
                    <TableHead className="w-[120px] text-center font-medium">
                      Tasa de Éxito
                    </TableHead>
                    <TableHead className="w-[140px] text-right font-medium">
                      Tiempo Prom.
                    </TableHead>
                    <TableHead className="w-[120px] text-right font-medium">
                      Errores Prom.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tareas.map((t, idx) => (
                    <TableRow key={`tarea-${idx}`}>
                      <TableCell className="font-medium text-foreground">
                        {t.titulo}
                      </TableCell>
                      <TableCell className="text-center">
                        {getTasaExitoBadge(t.tasa_exito)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground/70" />
                          {formatTiempo(t.tiempo_promedio_seg)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {t.errores_promedio.toFixed(1)} err
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Top 5 Hallazgos (1 columna en escritorio) */}
      <Card className="shadow-xs lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Top Hallazgos Frecuentes</span>
          </CardTitle>
          <CardDescription>
            Incidentes con mayor número de repeticiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topHallazgos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay hallazgos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {topHallazgos.slice(0, 5).map((h, idx) => (
                <div
                  key={h.id || `hallazgo-${idx}`}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                      {h.titulo}
                    </p>
                    <div className="flex items-center gap-2">
                      {getSeveridadBadge(h.severidad)}
                      <span className="text-[11px] text-muted-foreground">
                        {h.frecuencia} {h.frecuencia === 1 ? "ocurrencia" : "ocurrencias"}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

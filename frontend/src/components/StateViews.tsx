"use client";

import React from "react";
import { Loader2, Inbox, AlertCircle, RotateCcw } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Cargando datos...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-3 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No hay datos para mostrar",
  description = "No se encontraron registros en esta sección.",
  action,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center gap-3 ${className}`.trim()}
    >
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorState({
  title = "Ocurrió un error",
  message = "No se pudo cargar la información. Por favor, intenta de nuevo.",
  onRetry,
  retryText = "Reintentar",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 p-8 text-center gap-3 ${className}`.trim()}
      role="alert"
    >
      <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-3 text-red-600 dark:text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-semibold text-base text-red-700 dark:text-red-400">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-red-600/90 dark:text-red-300">
            {message}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
}

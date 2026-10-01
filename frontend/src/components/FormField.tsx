import React from "react";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        <span>{label}</span>
        {required && (
          <span className="text-red-500 font-bold" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;

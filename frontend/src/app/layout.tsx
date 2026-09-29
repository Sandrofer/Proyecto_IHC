import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Usability Dashboard",
  description: "Gestion de pruebas de usabilidad",
};

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/pruebas", label: "Pruebas" },
  { href: "/tareas", label: "Tareas" },
  { href: "/participantes", label: "Participantes" },
  { href: "/observaciones", label: "Observaciones" },
  { href: "/hallazgos", label: "Hallazgos" },
  { href: "/plan", label: "Plan" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r p-4">
          <h1 className="mb-6 text-lg font-bold">Usability Dashboard</h1>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded px-3 py-2 hover:bg-muted">
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
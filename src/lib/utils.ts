import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Poliza, KpiData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse date string in various formats to Date object.
 * Handles: DD/MM/YYYY, DD-MM-YYYY, D/M/YYYY, D-M-YYYY, etc.
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);

  const cleaned = dateStr.trim();

  // Try DD/MM/YYYY or DD-MM-YYYY (with any separator)
  const parts = cleaned.split(/[\/\-]/);
  if (parts.length === 3) {
    let [day, month, year] = parts.map(Number);
    // If year is 2-digit, assume 2000s
    if (year < 100) year += 2000;
    if (day > 0 && month > 0 && year > 0) {
      return new Date(year, month - 1, day);
    }
  }

  // Fallback
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

/**
 * Format number as Argentine currency
 */
export function formatCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return "$ 0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse cost value from various formats (number, "$3.586,00", "$ 335.500,00", etc.)
 */
export function parseCost(value: unknown): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const str = String(value).trim();
  if (!str) return 0;
  // Remove $, spaces, dots (thousands), then replace comma with dot
  const cleaned = str.replace(/[$\s.]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculate days remaining until a date
 */
export function daysUntil(dateStr: string): number {
  const target = parseDate(dateStr);
  if (target.getTime() === 0) return -1;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get pólizas expiring within N days, sorted by nearest date
 */
export function getExpiringPolizas(polizas: Poliza[], days: number = 30): Poliza[] {
  return polizas
    .filter((p) => {
      const remaining = daysUntil(p.VENCIMIENTO);
      return remaining >= 0 && remaining <= days;
    })
    .sort((a, b) => daysUntil(a.VENCIMIENTO) - daysUntil(b.VENCIMIENTO));
}

/**
 * Calculate KPI data from pólizas
 */
export function calculateKpis(polizas: Poliza[]): KpiData {
  const vigentes = polizas.filter((p) => p.ESTADO === "VIGENTE");
  const impagas = polizas.filter((p) => p.ESTADO === "IMPAGA");

  return {
    totalVigentes: vigentes.length,
    montoProyectado: vigentes.reduce((sum, p) => sum + (p.COSTO_MENSUAL || 0), 0),
    montoEnRiesgo: impagas.reduce((sum, p) => sum + (p.COSTO_MENSUAL || 0), 0),
  };
}

/**
 * Group pólizas by company and count
 */
export function groupByCompany(polizas: Poliza[]): { name: string; value: number }[] {
  const groups: Record<string, number> = {};
  polizas.forEach((p) => {
    const company = (p.COMPAÑIA || "Sin Compañía").trim();
    if (company) {
      groups[company] = (groups[company] || 0) + 1;
    }
  });
  return Object.entries(groups)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get the estado badge variant styling
 */
export function getEstadoStyle(estado: string): {
  className: string;
  label: string;
} {
  const normalized = (estado || "").trim().toUpperCase();
  switch (normalized) {
    case "VIGENTE":
      return {
        className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
        label: "Vigente",
      };
    case "IMPAGA":
      return {
        className: "bg-red-500/15 text-red-700 border-red-500/25",
        label: "Impaga",
      };
    case "A RENOVAR":
      return {
        className: "bg-amber-500/15 text-amber-700 border-amber-500/25",
        label: "A Renovar",
      };
    case "ANULADO":
      return {
        className: "bg-zinc-500/15 text-zinc-700 border-zinc-500/25",
        label: "Anulado",
      };
    case "OBSERVACION":
      return {
        className: "bg-purple-500/15 text-purple-700 border-purple-500/25",
        label: "Observación",
      };
    default:
      return {
        className: "bg-zinc-500/15 text-zinc-700 border-zinc-500/25",
        label: normalized || "—",
      };
  }
}

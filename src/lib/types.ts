export interface Poliza {
  id?: string;
  ESTADO: string; // VIGENTE, IMPAGA, A RENOVAR, ANULADO, OBSERVACION, etc.
  TELEFONO: string;
  CODIGO: string;
  FECHA: string;
  ASEGURADO: string;
  COMPAÑIA: string;
  POLIZA: string;
  COBERTURA: string;
  VENCIMIENTO: string;
  REFERENCIAS: string;
  COSTO_MENSUAL: number;
  OBSERVACION: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface KpiData {
  totalVigentes: number;
  montoProyectado: number;
  montoEnRiesgo: number;
}

export type CotizacionEstado = "VENDIDO" | "NO_VENDIDO" | "PENDIENTE";

export interface Cotizacion {
  id?: string;
  // Datos del usuario/cliente cotizado
  nombre_cliente: string;
  telefono_cliente: string;
  // Ramo
  ramo: string;
  // Compañías cotizadas (coma-separated o JSON string)
  companias_cotizadas: string;
  // Estado de la cotización
  estado: CotizacionEstado;
  // Notas opcionales
  observacion?: string;
  // Fecha de creación (manejada por Supabase / auto)
  created_at?: string;
}

export interface Siniestro {
  id?: string;
  nombre_cliente: string;
  telefono_cliente?: string;
  ramo: string;
  compania: string;
  resuelto: boolean;
  fecha_resolucion?: string;
  nota?: string;
  created_at?: string;
}

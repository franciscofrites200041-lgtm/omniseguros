export interface Poliza {
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

import { Poliza } from "./types";
import { mockPolizas } from "./mock-data";
import { parseCost } from "./utils";

const GET_DATA_URL = process.env.NEXT_PUBLIC_N8N_GET_DATA_WEBHOOK;
const NOTIFY_URL = process.env.NEXT_PUBLIC_N8N_NOTIFY_WEBHOOK;
const AGENT_URL = process.env.NEXT_PUBLIC_N8N_AGENT_WEBHOOK;
const UPDATE_URL = process.env.NEXT_PUBLIC_N8N_UPDATE_WEBHOOK;
const CREATE_URL = process.env.NEXT_PUBLIC_N8N_CREATE_WEBHOOK;

const USE_MOCK = !GET_DATA_URL || GET_DATA_URL.includes("tu-instancia");

/**
 * Normalize a raw row from n8n/Google Sheets into a clean Poliza object.
 * Handles field name mismatches (col_1 → ESTADO, COSTO MENSUAL → COSTO_MENSUAL),
 * whitespace/newline cleanup, and cost parsing.
 */
function normalizePoliza(raw: Record<string, unknown>): Poliza {
    return {
        ESTADO: String(raw.ESTADO || raw.col_1 || "")
            .trim()
            .replace(/[\n\t]/g, "")
            .toUpperCase(),
        TELEFONO: String(raw.TELEFONO || "")
            .trim()
            .replace(/[\n\t]/g, ""),
        CODIGO: String(raw.CODIGO || "").trim(),
        FECHA: String(raw.FECHA || "").trim(),
        ASEGURADO: String(raw.ASEGURADO || "")
            .trim()
            .replace(/[\n\t:]/g, "")
            .replace(/\s+/g, " "),
        COMPAÑIA: String(raw["COMPAÑIA"] || raw["COMPANIA"] || "")
            .trim()
            .replace(/[\n\t]/g, ""),
        POLIZA: String(raw.POLIZA || "")
            .trim()
            .replace(/[\n\t|]/g, ""),
        COBERTURA: String(raw.COBERTURA || "").trim(),
        VENCIMIENTO: String(raw.VENCIMIENTO || "").trim(),
        REFERENCIAS: String(raw.REFERENCIAS || "").trim(),
        COSTO_MENSUAL: parseCost(raw.COSTO_MENSUAL ?? raw["COSTO MENSUAL"]),
        OBSERVACION: String(raw.OBSERVACION || "").trim(),
    };
}

export async function fetchPolizas(): Promise<Poliza[]> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        return mockPolizas;
    }

    try {
        const res = await fetch(GET_DATA_URL!, { cache: "no-store" });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // Handle all possible n8n response formats:
        // 1. Direct array: [{...}, {...}, ...]
        // 2. Single object: {...} → wrap in array
        // 3. Wrapped in property: { data: [...] } or { items: [...] }
        let rawArray: Record<string, unknown>[];
        if (Array.isArray(data)) {
            rawArray = data;
        } else if (data && typeof data === "object") {
            // Check if it's a wrapper with a nested array
            const nested = data.data || data.items || data.polizas || data.rows;
            if (Array.isArray(nested)) {
                rawArray = nested;
            } else {
                // Single object → wrap in array
                rawArray = [data as Record<string, unknown>];
            }
        } else {
            rawArray = [];
        }

        const polizas = rawArray.map(normalizePoliza);
        console.log(`✅ Loaded ${polizas.length} pólizas from n8n`);
        return polizas;
    } catch (error) {
        console.error("❌ Error fetching pólizas:", error);
        return mockPolizas; // Fallback to mock
    }
}

export async function sendNotification(poliza: Poliza): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK || !NOTIFY_URL) {
        await new Promise((r) => setTimeout(r, 600));
        return {
            success: true,
            message: `Notificación simulada enviada a ${poliza.ASEGURADO} (${poliza.TELEFONO})`,
        };
    }

    try {
        const res = await fetch(NOTIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                telefono: poliza.TELEFONO,
                asegurado: poliza.ASEGURADO,
                poliza: poliza.POLIZA,
                vencimiento: poliza.VENCIMIENTO,
                compania: poliza.COMPAÑIA,
                cobertura: poliza.COBERTURA,
                costoMensual: poliza.COSTO_MENSUAL,
            }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return { success: true, message: `Notificación enviada a ${poliza.ASEGURADO}` };
    } catch (error) {
        console.error("Error sending notification:", error);
        return { success: false, message: "Error al enviar la notificación" };
    }
}

export async function sendChatMessage(message: string): Promise<string> {
    if (USE_MOCK || !AGENT_URL) {
        await new Promise((r) => setTimeout(r, 1200));
        const responses = [
            `Según los registros, hay ${mockPolizas.filter((p) => p.ESTADO === "VIGENTE").length} pólizas vigentes actualmente.`,
            `Las pólizas impagas suman un total de $${mockPolizas.filter((p) => p.ESTADO === "IMPAGA").reduce((sum, p) => sum + p.COSTO_MENSUAL, 0).toLocaleString("es-AR")} en riesgo mensual.`,
            `El próximo vencimiento es de ${mockPolizas[0].ASEGURADO}, con la póliza ${mockPolizas[0].POLIZA} de ${mockPolizas[0].COMPAÑIA}.`,
            "Puedo ayudarte a consultar estados de pólizas, vencimientos próximos, montos pendientes y más. ¿Qué necesitás saber?",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
        const res = await fetch(AGENT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);

        // n8n agents may return plain text or JSON
        const text = await res.text();
        try {
            let data = JSON.parse(text);
            // n8n often returns an array with one item: [{ "output": "..." }]
            if (Array.isArray(data)) {
                data = data[0] || {};
            }
            // Handle various n8n response formats
            return (
                data.output ??
                data.response ??
                data.message ??
                data.text ??
                data.answer ??
                data.content ??
                data.reply ??
                (typeof data === "string" ? data : JSON.stringify(data))
            );
        } catch {
            // Response is plain text, not JSON
            return text || "Sin respuesta del agente.";
        }
    } catch (error) {
        console.error("Error en chat:", error);
        return "Lo siento, hubo un error al procesar tu consulta. Por favor, intentá de nuevo.";
    }
}

export async function updatePolizaEstado(
    polizaNumber: string,
    nuevoEstado: string
): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK || !UPDATE_URL) {
        await new Promise((r) => setTimeout(r, 500));
        return {
            success: true,
            message: `Estado de ${polizaNumber} actualizado a ${nuevoEstado} (simulado)`,
        };
    }

    try {
        const res = await fetch(UPDATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ poliza: polizaNumber, estado: nuevoEstado }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return { success: true, message: `Estado actualizado a ${nuevoEstado}` };
    } catch (error) {
        console.error("Error updating estado:", error);
        return { success: false, message: "Error al actualizar el estado" };
    }
}

export async function createPoliza(
    poliza: Omit<Poliza, "CODIGO">
): Promise<{ success: boolean; message: string; codigo?: string }> {
    const newCodigo = `POL-${String(Date.now()).slice(-6)}`;

    if (USE_MOCK || !CREATE_URL) {
        await new Promise((r) => setTimeout(r, 700));
        return {
            success: true,
            message: `Póliza ${newCodigo} creada exitosamente (simulado)`,
            codigo: newCodigo,
        };
    }

    try {
        const res = await fetch(CREATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...poliza, CODIGO: newCodigo }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        return {
            success: true,
            message: `Póliza creada exitosamente`,
            codigo: data.codigo ?? newCodigo,
        };
    } catch (error) {
        console.error("Error creating póliza:", error);
        return { success: false, message: "Error al crear la póliza" };
    }
}

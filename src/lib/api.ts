import { Poliza } from "./types";
import { mockPolizas } from "./mock-data";
import { parseCost } from "./utils";
import { createClient } from "@/utils/supabase/client";

const GET_DATA_URL = process.env.NEXT_PUBLIC_N8N_GET_DATA_WEBHOOK;
const NOTIFY_URL = process.env.NEXT_PUBLIC_N8N_NOTIFY_WEBHOOK;
const AGENT_URL = process.env.NEXT_PUBLIC_N8N_AGENT_WEBHOOK;
const UPDATE_URL = process.env.NEXT_PUBLIC_N8N_UPDATE_WEBHOOK;
const CREATE_URL = process.env.NEXT_PUBLIC_N8N_CREATE_WEBHOOK;

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Mapeo de columnas a la base de datos local / Excel super robusto (ignora mayúsculas, tildes y espacios)
 */
export function normalizePoliza(raw: Record<string, unknown>): Poliza {
    // Normalizar las claves del objeto entrante para que no importen las mayúsculas ni los espacios
    const normalizedRaw: Record<string, unknown> = {};
    for (const key in raw) {
        if (Object.prototype.hasOwnProperty.call(raw, key)) {
            const trimmedKey = key.trim();
            // Quitamos tildes para la clave y pasamos a minúscula
            const cleanKey = trimmedKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            normalizedRaw[cleanKey] = raw[key];

            // Si la clave está vacía o es genérica (Columna_1, Col_0), intentar detectar qué campo es
            // mirando el valor. Si parece un estado (VIGENTE, IMPAGA, etc.), asignarlo como 'estado'
            if (cleanKey === "" || cleanKey.startsWith("columna_") || cleanKey.startsWith("col_")) {
                const val = String(raw[key] || "").trim().toUpperCase();
                if (["VIGENTE", "IMPAGA", "A RENOVAR", "ANULADO", "OBSERVACION", "ANULADA", "VENCIDA"].includes(val)) {
                    normalizedRaw["estado"] = raw[key];
                }
            }
        }
    }

    // Buscar el valor en las distintas posibles variaciones de nombre de columna normalizadas
    const getValue = (keys: string[]) => {
        for (const k of keys) {
            if (normalizedRaw[k] !== undefined && normalizedRaw[k] !== null && normalizedRaw[k] !== "") {
                return normalizedRaw[k];
            }
        }
        return "";
    };

    return {
        id: raw.id ? String(raw.id) : undefined,
        ESTADO: String(getValue(["estado", "est", "status", "col_1"]))
            .trim()
            .toUpperCase(),
        TELEFONO: String(getValue(["telefono", "tel"])).trim(),
        CODIGO: String(getValue(["codigo", "cod"])).trim(),
        FECHA: String(getValue(["fecha", "date"])).trim(),
        ASEGURADO: String(getValue(["asegurado", "cliente", "nombre"])).trim(),
        COMPAÑIA: String(getValue(["compania", "aseguradora", "empresa"])).trim(),
        POLIZA: String(getValue(["poliza", "numero_poliza", "nro_poliza", "numero de poliza", "n poliza", "nro poliza"])).trim(),
        COBERTURA: String(getValue(["cobertura", "riesgo"])).trim(),
        VENCIMIENTO: String(getValue(["vencimiento", "vto", "fecha_vto", "hasta"])).trim(),
        REFERENCIAS: String(getValue(["referencias", "ref"])).trim(),
        COSTO_MENSUAL: parseCost(getValue(["costo_mensual", "costo mensual", "cuota", "premio", "costo", "monto", "importe"])),
        OBSERVACION: String(getValue(["observacion", "observaciones", "obs"])).trim(),
    };
}

export async function fetchPolizas(): Promise<Poliza[]> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        return mockPolizas;
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        // Traer desde Supabase ordenado por fecha de creacion descendente
        const { data, error } = await supabase
            .from("polizas")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            throw new Error(error.message);
        }

        const polizas = (data || []).map(normalizePoliza);
        console.log(`✅ Loaded ${polizas.length} pólizas from Supabase`);
        return polizas;
    } catch (error) {
        console.error("❌ Error fetching pólizas from DB:", error);
        return mockPolizas; // Fallback to mock
    }
}

export async function sendNotification(poliza: Poliza): Promise<{ success: boolean; message: string }> {
    if (!NOTIFY_URL) {
        await new Promise((r) => setTimeout(r, 600));
        return {
            success: true,
            message: `Notificación simulada enviada a ${poliza.ASEGURADO} (${poliza.TELEFONO})`,
        };
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const res = await fetch(NOTIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user?.id,
                user_email: user?.email,
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
    if (!AGENT_URL) {
        await new Promise((r) => setTimeout(r, 1200));
        const responses = [
            `Según los registros locales, todo está en orden.`,
            `No veo irregularidades en tu cartera hoy.`,
            "Puedo ayudarte a consultar estados de pólizas, vencimientos próximos, montos pendientes y más. ¿Qué necesitás saber?",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const res = await fetch(AGENT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, user_id: user?.id }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const text = await res.text();
        try {
            let data = JSON.parse(text);
            if (Array.isArray(data)) {
                data = data[0] || {};
            }
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
            return text || "Sin respuesta del agente.";
        }
    } catch (error) {
        console.error("Error en chat:", error);
        return "Lo siento, hubo un error al procesar tu consulta. Por favor, intentá de nuevo.";
    }
}

export async function updatePolizaEstado(
    polizaCodigo: string,
    nuevoEstado: string
): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
        return {
            success: true,
            message: `Estado actualizado (simulado)`,
        };
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        const { error } = await supabase
            .from("polizas")
            .update({ estado: nuevoEstado })
            .match({ codigo: polizaCodigo, user_id: user.id });

        if (error) {
            console.error("DB update error:", error);
            throw new Error(error.message);
        }

        return { success: true, message: `Estado actualizado a ${nuevoEstado}` };
    } catch (error) {
        console.error("Error updating estado:", error);
        return { success: false, message: "Error al actualizar el estado" };
    }
}

export async function updatePolizaFull(
    idOrCodigo: string,
    polizaUpdate: Partial<Poliza>
): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        return { success: true, message: `Póliza/Cliente actualizado (simulado)` };
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        // Construir payload
        const payload: Record<string, any> = {};
        if (polizaUpdate.ESTADO !== undefined) payload.estado = polizaUpdate.ESTADO;
        if (polizaUpdate.TELEFONO !== undefined) payload.telefono = polizaUpdate.TELEFONO;
        if (polizaUpdate.FECHA !== undefined) payload.fecha = polizaUpdate.FECHA;
        if (polizaUpdate.ASEGURADO !== undefined) payload.asegurado = polizaUpdate.ASEGURADO;
        if (polizaUpdate.COMPAÑIA !== undefined) payload.compania = polizaUpdate.COMPAÑIA;
        if (polizaUpdate.POLIZA !== undefined) payload.numero_poliza = polizaUpdate.POLIZA;
        if (polizaUpdate.COBERTURA !== undefined) payload.cobertura = polizaUpdate.COBERTURA;
        if (polizaUpdate.VENCIMIENTO !== undefined) payload.vencimiento = polizaUpdate.VENCIMIENTO;
        if (polizaUpdate.OBSERVACION !== undefined) payload.observacion = polizaUpdate.OBSERVACION;
        if (polizaUpdate.COSTO_MENSUAL !== undefined) payload.costo_mensual = String(polizaUpdate.COSTO_MENSUAL);

        const matchCriteria = idOrCodigo.includes('-') && idOrCodigo.length > 30
            ? { id: idOrCodigo, user_id: user.id }
            : { codigo: idOrCodigo, user_id: user.id };

        const { error } = await supabase
            .from("polizas")
            .update(payload)
            .match(matchCriteria);

        if (error) {
            console.error("DB full update error:", error);
            throw new Error(error.message);
        }

        return { success: true, message: "Datos actualizados correctamente" };
    } catch (error: any) {
        console.error("Error full update:", error);
        return { success: false, message: error.message || "Error al actualizar los datos en DB" };
    }
}

export async function createPoliza(
    poliza: Omit<Poliza, "CODIGO" | "id">
): Promise<{ success: boolean; message: string; codigo?: string; id?: string }> {
    const newCodigo = `POL-${String(Date.now()).slice(-6)}`;

    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 700));
        return {
            success: true,
            message: `Póliza ${newCodigo} creada (simulado)`,
            codigo: newCodigo,
        };
    }

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        const dbPayload = {
            user_id: user.id,
            estado: poliza.ESTADO,
            telefono: poliza.TELEFONO,
            codigo: newCodigo,
            fecha: poliza.FECHA,
            asegurado: poliza.ASEGURADO,
            compania: poliza.COMPAÑIA,
            numero_poliza: poliza.POLIZA,
            cobertura: poliza.COBERTURA,
            vencimiento: poliza.VENCIMIENTO,
            costo_mensual: String(poliza.COSTO_MENSUAL),
            observacion: poliza.OBSERVACION
        };

        const { data, error } = await supabase
            .from("polizas")
            .insert(dbPayload)
            .select()
            .single();

        if (error) {
            console.error("DB insert error:", error);
            throw new Error(error.message);
        }

        return {
            success: true,
            message: `Póliza creada exitosamente`,
            codigo: newCodigo,
            id: data?.id
        };
    } catch (error) {
        console.error("Error creating póliza:", error);
        return { success: false, message: "Error al crear la póliza en DB" };
    }
}

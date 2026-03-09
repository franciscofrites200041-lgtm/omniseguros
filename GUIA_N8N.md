# Guía de Configuración de Flujos en n8n

Esta guía te ayudará a construir los 2 flujos principales en n8n para conectar con el Dashboard de Seguros.

---

## Flujo 1: Extracción de Datos (Google Sheets → JSON)

Este flujo responde al dashboard con todas las pólizas en formato JSON.

### Paso 1: Nodo Webhook (Trigger)
1. Agregá un nodo **Webhook**
2. Configurá:
   - **HTTP Method**: `GET`
   - **Path**: `get-polizas`
   - **Response Mode**: `Last Node` (esto es clave para responder con datos)
3. Copiá la **URL de producción** y pegala en tu `.env.local` como `NEXT_PUBLIC_N8N_GET_DATA_WEBHOOK`

### Paso 2: Nodo Google Sheets (Leer datos)
1. Agregá un nodo **Google Sheets**
2. Configurá:
   - **Operation**: `Read Rows`
   - **Document**: Seleccioná tu planilla de seguros
   - **Sheet**: Seleccioná la hoja con los datos
   - **Options → Data Location on Sheet**: `Header Row`, primera fila
3. Conectá las credenciales de Google (OAuth2 o Service Account)

### Paso 3: Nodo Code (Formatear JSON)
1. Agregá un nodo **Code** (JavaScript)
2. Pegá este código:

```javascript
const items = $input.all();

const polizas = items.map(item => ({
  ESTADO: item.json.ESTADO || '',
  TELEFONO: item.json.TELEFONO || '',
  CODIGO: item.json.CODIGO || '',
  FECHA: item.json.FECHA || '',
  ASEGURADO: item.json.ASEGURADO || '',
  'COMPAÑIA': item.json['COMPAÑIA'] || item.json.COMPANIA || '',
  POLIZA: item.json.POLIZA || '',
  COBERTURA: item.json.COBERTURA || '',
  VENCIMIENTO: item.json.VENCIMIENTO || '',
  REFERENCIAS: item.json.REFERENCIAS || '',
  COSTO_MENSUAL: parseFloat(item.json['COSTO MENSUAL'] || item.json.COSTO_MENSUAL || '0'),
  OBSERVACION: item.json.OBSERVACION || '',
}));

return [{ json: polizas }];
```

### Paso 4: Nodo Respond to Webhook
1. Agregá un nodo **Respond to Webhook**
2. Configurá:
   - **Respond With**: `All Incoming Items`
3. Conectá: `Webhook → Google Sheets → Code → Respond to Webhook`

### Paso 5: Activar el flujo
1. Hacé clic en **"Activate"** arriba a la derecha
2. Probalo con la URL de producción en el navegador

---

## Flujo 2: Notificación por WhatsApp

Este flujo recibe datos de una póliza y envía un mensaje de WhatsApp.

### Paso 1: Nodo Webhook (Trigger)
1. Agregá un nodo **Webhook**
2. Configurá:
   - **HTTP Method**: `POST`
   - **Path**: `notify-whatsapp`
   - **Response Mode**: `Last Node`
3. Copiá la URL y pegala como `NEXT_PUBLIC_N8N_NOTIFY_WEBHOOK`

### Paso 2: Nodo Code (Componer mensaje)
1. Agregá un nodo **Code**:

```javascript
const data = $input.first().json;

const mensaje = `🔔 *Aviso de Vencimiento de Póliza*

Estimado/a *${data.asegurado}*,

Le informamos que su póliza *${data.poliza}* de *${data.compania}* con cobertura _${data.cobertura}_ vence el *${data.vencimiento}*.

Costo mensual: *$${Number(data.costoMensual).toLocaleString()}*

Por favor, comuníquese con nosotros para gestionar la renovación.

_Mensaje automático - Gestión de Seguros_`;

return [{ json: { telefono: data.telefono, mensaje } }];
```

### Paso 3: Nodo WhatsApp / HTTP Request
- **Opción A** (WhatsApp Business API): Usá el nodo de WhatsApp de n8n con tus credenciales
- **Opción B** (Evolution API / Baileys): Usá un nodo **HTTP Request** con un POST a tu instancia

### Paso 4: Nodo Respond to Webhook
1. Respondé con `{ "success": true, "message": "Notificación enviada" }`

---

## Flujo 3: Agente de IA (Chat Inteligente)

Este flujo permite al usuario hacer preguntas en lenguaje natural sobre las pólizas.

### Paso 1: Nodo Webhook (Trigger)
1. Agregá un nodo **Webhook**
2. Configurá:
   - **HTTP Method**: `POST`
   - **Path**: `ai-agent`
   - **Response Mode**: `Last Node`
3. Copiá la URL y pegala como `NEXT_PUBLIC_N8N_AGENT_WEBHOOK`

### Paso 2: Nodo AI Agent
1. Agregá un nodo **AI Agent** (disponible en n8n v1.19+)
2. Configurá:
   - **Input Text**: `{{ $json.message }}` (viene del body del webhook)
   - **System Message**:

```
Sos un asistente experto en gestión de seguros. Tenés acceso a la planilla
de pólizas de la empresa, que incluye información de asegurados, compañías,
estados (VIGENTE, IMPAGA, A RENOVAR), vencimientos, costos y más.

Respondé siempre de forma clara, concisa y profesional en español.
Usá los datos reales de la planilla para responder. Si no encontrás
información, indicalo amablemente.
```

### Paso 3: Modelo de Lenguaje (Sub-nodo)
1. Conectá un sub-nodo **OpenAI Chat Model** (o **Anthropic**) al AI Agent:
   - **Model**: `gpt-4o` (o `claude-3-5-sonnet`)
   - **Credenciales**: Tu API Key de OpenAI/Anthropic

### Paso 4: Memoria (Sub-nodo)
1. Conectá un sub-nodo **Window Buffer Memory**:
   - **Session Key**: `{{ $json.sessionId || 'default' }}`
   - **Context Window Length**: `10` (guarda los últimos 10 mensajes)

### Paso 5: Tool — Google Sheets (Sub-nodo)
1. Agregá un **Tool** al AI Agent
2. Seleccioná tipo: **Google Sheets Tool** o creá un **Custom Tool**:
   - **Name**: `consultar_polizas`
   - **Description**: `Lee la planilla de seguros con todas las pólizas, estados, vencimientos y costos. Usá esta herramienta cuando necesites datos de asegurados o pólizas.`
   - Dentro del tool, conectá un nodo **Google Sheets** (Read Rows) con la misma planilla

### Paso 6: Nodo Respond to Webhook
1. Respondé con el output del agente:
   - **Respond With**: `First Incoming Item`
   - El output se verá como `{ "output": "respuesta del agente..." }`

### Paso 7: Activar
1. Activá el flujo
2. Probalo desde el chat del dashboard

---

## Diagrama de Conexiones

```
FLUJO 1 (Datos):
  Webhook GET → Google Sheets (Read) → Code (format) → Respond to Webhook

FLUJO 2 (Notificación):
  Webhook POST → Code (compose msg) → WhatsApp/HTTP → Respond to Webhook

FLUJO 3 (Agente IA):
  Webhook POST → AI Agent → Respond to Webhook
                    ├── OpenAI/Anthropic (LLM)
                    ├── Window Buffer Memory
                    └── Tool: Google Sheets (Read)
```

---

## Variables de Entorno Requeridas

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_N8N_GET_DATA_WEBHOOK` | URL del webhook GET del Flujo 1 |
| `NEXT_PUBLIC_N8N_NOTIFY_WEBHOOK` | URL del webhook POST del Flujo 2 |
| `NEXT_PUBLIC_N8N_AGENT_WEBHOOK` | URL del webhook POST del Flujo 3 |

> **Nota**: Mientras no configures las URLs reales, el dashboard usará datos mock de demostración automáticamente.

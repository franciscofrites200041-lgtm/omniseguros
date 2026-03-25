"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as xlsx from "xlsx";
import {
    UploadCloud,
    FileSpreadsheet,
    FileWarning,
    CheckCircle2,
    ArrowRight,
    X,
    Server,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { normalizePoliza } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type ImportStep = "upload" | "preview" | "mapping";

export function ExcelImporter() {
    const router = useRouter();
    const [step, setStep] = useState<ImportStep>("upload");
    const [fileName, setFileName] = useState<string | null>(null);
    const [columns, setColumns] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fullData, setFullData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        setIsParsing(true);
        setUploadError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = xlsx.read(data, { type: "array" });

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Extraemos TODO como una grilla cruda de arrays
                const rawArrayData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

                if (rawArrayData.length > 0) {
                    // 1. Encontrar la fila que realmente contiene los encabezados.
                    // Asumimos que la fila de encabezados es la primera que tiene al menos 4 columnas no vacías
                    let headerRowIndex = 0;
                    for (let i = 0; i < Math.min(20, rawArrayData.length); i++) {
                        const row = rawArrayData[i];
                        const nonEmpties = row.filter(cell => cell && String(cell).trim().length > 0);
                        if (nonEmpties.length >= 4) {
                            headerRowIndex = i;
                            break;
                        }
                    }

                    // 2. Extraer los encabezados limpios
                    const extractedCols = rawArrayData[headerRowIndex];
                    const cleanCols = extractedCols.map((c, i) => c ? String(c).trim() : `Columna_${i + 1}`);
                    setColumns(cleanCols);

                    // 3. Extraer solo las filas de datos (después de los encabezados)
                    // Ignoramos las filas completamente vacías
                    const dataRows = rawArrayData.slice(headerRowIndex + 1).filter(row =>
                        row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== "")
                    );

                    // 4. Convertir cada fila de array a un objeto usando los encabezados correctos
                    const objectData = dataRows.map(row => {
                        const obj: Record<string, any> = {};
                        cleanCols.forEach((colName, index) => {
                            obj[colName] = row[index];
                        });
                        return obj;
                    });

                    const rowsForPreview = objectData.slice(0, 10);
                    setPreviewData(rowsForPreview.map(obj => Object.values(obj)));
                    setFullData(objectData);
                }

                setIsParsing(false);
                setStep("preview");
            } catch (error) {
                console.error("Error al leer el archivo Excel", error);
                setUploadError("El archivo no es válido o está corrupto.");
                setIsParsing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    const resetImport = () => {
        setStep("upload");
        setFileName(null);
        setColumns([]);
        setPreviewData([]);
        setFullData([]);
        setUploadError(null);
    };

    const handleImportToSupabase = async () => {
        setIsUploading(true);
        setUploadError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Sesión expirada o inválida. Inicia sesión de nuevo.");
            }

            // Normalizar pólizas con el DTO
            const polizasFormateadas = fullData.map(normalizePoliza);

            console.log(`📊 Datos parseados del Excel: ${polizasFormateadas.length} filas`);
            console.log(`📊 Ejemplo de primera fila:`, polizasFormateadas[0]);

            // Armar payload de base de datos
            // El CODIGO se guarda tal cual viene del Excel
            const payload = polizasFormateadas.map((p, index) => ({
                user_id: user.id,
                estado: p.ESTADO || "VIGENTE",
                telefono: p.TELEFONO,
                codigo: p.CODIGO || "",
                fecha: p.FECHA,
                asegurado: p.ASEGURADO || "Sin nombre",
                compania: p.COMPAÑIA || "Sin compañía",
                numero_poliza: p.POLIZA || "Sin número",
                cobertura: p.COBERTURA,
                vencimiento: p.VENCIMIENTO,
                costo_mensual: String(p.COSTO_MENSUAL),
                observacion: p.OBSERVACION
            }));

            // PASO 1: Borrar TODOS los registros anteriores del usuario
            // Esto asegura una carga limpia cada vez que se importa
            const { error: deleteError } = await supabase
                .from("polizas")
                .delete()
                .eq("user_id", user.id);

            if (deleteError) {
                console.error("Error al borrar datos anteriores:", deleteError);
                throw new Error("Error al limpiar registros anteriores: " + deleteError.message);
            }

            console.log(`🗑️ Registros anteriores eliminados correctamente`);

            // PASO 2: Insertar TODAS las filas nuevas por lotes
            const chunkSize = 500;
            let totalInserted = 0;
            for (let i = 0; i < payload.length; i += chunkSize) {
                const chunk = payload.slice(i, i + chunkSize);
                const { error } = await supabase.from("polizas").insert(chunk);
                if (error) {
                    console.error(`Error insertando lote ${i}-${i + chunk.length}:`, error);
                    throw new Error(`Error al guardar datos (fila ~${i + 1}): ${error.message}`);
                }
                totalInserted += chunk.length;
                console.log(`✅ Insertadas ${totalInserted}/${payload.length} filas`);
            }

            // Cambiar la UI a estado de éxito internamente en lugar de un alert
            setStep("success" as any);
            setIsUploading(false);

            // Redirigir suavemente luego de 2 segundos
            setTimeout(() => {
                router.push("/");
                router.refresh();
            }, 2000);

        } catch (error: any) {
            console.error("Error guardando datos:", error);
            setUploadError(error.message || "Ocurrió un error al subir los datos.");
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Encabezado / Pasos */}
            <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Importar Clientes</h2>
                    <p className="text-zinc-500 mt-1">Carga tu base de datos desde un archivo Excel o CSV.</p>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
                    <div className={cn("flex items-center gap-2", step === "upload" ? "text-[#59CBE8]" : "text-zinc-400")}>
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs text-white", step === "upload" ? "bg-[#59CBE8]" : "bg-zinc-300")}>1</div>
                        Subir Archivo
                    </div>
                    <div className="w-8 h-px bg-zinc-200" />
                    <div className={cn("flex items-center gap-2", step === "preview" ? "text-[#59CBE8]" : "text-zinc-400")}>
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs text-white", step === "preview" ? "bg-[#59CBE8]" : "bg-zinc-300")}>2</div>
                        Validar y Guardar
                    </div>
                </div>
            </div>

            {/* Paso 1: Subir */}
            {step === "upload" && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "mt-6 border-2 border-dashed rounded-xl p-16 transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center",
                        isDragActive ? "border-[#59CBE8] bg-[#59CBE8]/5" : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50",
                        isDragReject && "border-red-500 bg-red-50",
                        isParsing && "opacity-50 pointer-events-none"
                    )}
                >
                    <input {...getInputProps()} />

                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-200",
                        isDragActive ? "bg-[#59CBE8]/10 text-[#59CBE8]" : "bg-zinc-100 text-zinc-500",
                        isDragReject && "bg-red-100 text-red-600"
                    )}>
                        {isDragReject ? (
                            <FileWarning className="h-10 w-10" />
                        ) : isDragActive ? (
                            <UploadCloud className="h-10 w-10 animate-bounce" />
                        ) : (
                            <FileSpreadsheet className="h-10 w-10" />
                        )}
                    </div>

                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                        {isDragActive ? "Suelta el archivo aquí..." : "Arrastra tu Excel aquí"}
                    </h3>

                    <p className="text-zinc-500 max-w-md mx-auto mb-8">
                        Formatos soportados: <strong className="font-medium text-zinc-700">.xlsx, .xls, .csv</strong>.
                        Asegurate de que la primera fila contenga los nombres de las columnas.
                    </p>

                    <Button type="button" variant="outline" className="gap-2 bg-white" disabled={isParsing}>
                        Seleccionar archivo manualmente
                    </Button>
                </div>
            )}

            {/* Paso 2: Vista Previa */}
            {step === "preview" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                    <Card className="border-emerald-200 shadow-sm overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                                            ¡Archivo procesado con éxito!
                                        </h3>
                                        <p className="text-sm text-zinc-500 mt-1">
                                            Se van a importar <span className="font-medium text-zinc-700">{fullData.length}</span> registros de {fileName}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={resetImport} disabled={isUploading} className="text-zinc-500 hover:text-zinc-900 shrink-0">
                                    <X className="h-4 w-4 mr-2" /> Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {uploadError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                            {uploadError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-zinc-900">Previsualización de datos</h3>
                            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md font-medium">Mostrando las primeras {previewData.length} filas</span>
                        </div>

                        <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
                            <div className="overflow-x-auto max-h-[400px]">
                                <Table>
                                    <TableHeader className="bg-zinc-50 sticky top-0 z-10">
                                        <TableRow className="hover:bg-transparent">
                                            {columns.map((col, i) => (
                                                <TableHead key={i} className="whitespace-nowrap font-semibold text-zinc-700 h-10 py-2">
                                                    {col}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.length > 0 ? previewData.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {columns.map((_, colIndex) => (
                                                    <TableCell key={colIndex} className="whitespace-nowrap text-zinc-600 py-3">
                                                        {row[colIndex] !== undefined && row[colIndex] !== null ? String(row[colIndex]) : <span className="text-zinc-300 italic">-</span>}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">
                                                    No se encontraron datos en el archivo.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-[#59CBE8]/10 flex items-center justify-center shrink-0">
                                <Server className="h-5 w-5 text-[#59CBE8]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900">Guardar Clientes</h4>
                                <p className="text-sm text-zinc-600 mt-1 max-w-xl">
                                    Esta acción procesará y guardará de forma segura el registro en tu servidor.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleImportToSupabase}
                            disabled={isUploading}
                            className="w-full sm:w-auto gap-2 bg-gradient-to-br from-[#59CBE8] to-[#4ABBD7] text-white hover:opacity-90 shadow-sm shrink-0"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</>
                            ) : (
                                <>Cargar registros <ArrowRight className="h-4 w-4" /></>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Paso 3: Éxito */}
            {(step as any) === "success" && (
                <div className="mt-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 fade-in">
                    <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 relative">
                        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 opacity-75"></div>
                        <CheckCircle2 className="h-12 w-12 z-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">¡Carga Completada!</h3>
                    <p className="text-zinc-500 max-w-md">
                        Se importaron correctamente {fullData.length} registros a tu área de trabajo segura. Te estamos redirigiendo a tu pantalla principal...
                    </p>
                </div>
            )}
        </div>
    );
}

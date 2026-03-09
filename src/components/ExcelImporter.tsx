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
    Server
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

type ImportStep = "upload" | "preview" | "mapping";

export function ExcelImporter() {
    const [step, setStep] = useState<ImportStep>("upload");
    const [fileName, setFileName] = useState<string | null>(null);
    const [columns, setColumns] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = xlsx.read(data, { type: "array" });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON (array of arrays for preview)
                const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length > 0) {
                    const extractedCols = jsonData[0] as string[];
                    // Fill empty column names
                    const cleanCols = extractedCols.map((c, i) => c ? String(c).trim() : `Columna ${i + 1}`);
                    setColumns(cleanCols);

                    // Take up to 10 rows for preview
                    const rows = jsonData.slice(1, 11).filter((row: any) => row.length > 0);
                    setPreviewData(rows);
                }

                setIsParsing(false);
                setStep("preview");
            } catch (error) {
                console.error("Error al leer el archivo Excel", error);
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
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Encabezado / Pasos */}
            <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Importar Clientes</h2>
                    <p className="text-zinc-500 mt-1">Carga tu base de datos desde un archivo Excel o CSV.</p>
                </div>

                {/* Indicador de progreso visual simple */}
                <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
                    <div className={cn("flex items-center gap-2", step === "upload" ? "text-blue-600" : "text-zinc-400")}>
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs text-white", step === "upload" ? "bg-blue-600" : "bg-zinc-300")}>1</div>
                        Subir Archivo
                    </div>
                    <div className="w-8 h-px bg-zinc-200" />
                    <div className={cn("flex items-center gap-2", step === "preview" ? "text-blue-600" : "text-zinc-400")}>
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs text-white", step === "preview" ? "bg-blue-600" : "bg-zinc-300")}>2</div>
                        Validar Datos
                    </div>
                </div>
            </div>

            {/* Paso 1: Subir */}
            {step === "upload" && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "mt-6 border-2 border-dashed rounded-xl p-16 transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center",
                        isDragActive ? "border-blue-500 bg-blue-50/50" : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50",
                        isDragReject && "border-red-500 bg-red-50",
                        isParsing && "opacity-50 pointer-events-none"
                    )}
                >
                    <input {...getInputProps()} />

                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-200",
                        isDragActive ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500",
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
                        {/* Cinta lateral de éxito decorativa */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                                            ¡Archivo leído con éxito!
                                        </h3>
                                        <p className="text-sm text-zinc-500 mt-1">
                                            Archivo: <span className="font-medium text-zinc-700">{fileName}</span> ({columns.length} columnas detectadas)
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={resetImport} className="text-zinc-500 hover:text-zinc-900 shrink-0">
                                    <X className="h-4 w-4 mr-2" /> Cancelar y subir otro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Server className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-zinc-900">Configuración de Base de Datos</h4>
                                <p className="text-sm text-zinc-600 mt-1 max-w-xl">
                                    Aquí es donde conectaríamos los datos visuales con el Backend para el mapeo real de columnas (ej. Nombre {'->'} ASEGURADO) y su guardado en PostgreSQL.
                                </p>
                            </div>
                        </div>
                        <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0">
                            Continuar a Mapeo <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

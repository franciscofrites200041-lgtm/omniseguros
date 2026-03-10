"use client";

import { useState } from "react";
import {
    Bell,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Poliza } from "@/lib/types";
import { formatCurrency, daysUntil } from "@/lib/utils";
import { sendNotification } from "@/lib/api";

interface AlertsTableProps {
    polizas: Poliza[];
    allPolizas: Poliza[];
    loading?: boolean;
}

type ViewMode = "vencimientos" | "impagas";

const viewLabels: Record<ViewMode, { title: string; badge: string }> = {
    vencimientos: {
        title: "Alertas de Vencimiento",
        badge: "Próximos 30 días",
    },
    impagas: {
        title: "Pólizas Impagas",
        badge: "Requieren atención",
    },
};

function TableSkeleton() {
    return (
        <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4">
                    <div className="h-6 w-20 rounded bg-zinc-200" />
                    <div className="h-6 w-40 rounded bg-zinc-200" />
                    <div className="h-6 w-28 rounded bg-zinc-200" />
                    <div className="h-6 w-32 rounded bg-zinc-200" />
                    <div className="h-6 w-24 rounded bg-zinc-200" />
                    <div className="ml-auto h-9 w-24 rounded bg-zinc-200" />
                </div>
            ))}
        </div>
    );
}

export function AlertsTable({ polizas, allPolizas, loading }: AlertsTableProps) {
    const [notifyingId, setNotifyingId] = useState<string | null>(null);
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>("vencimientos");
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    const impagas = allPolizas.filter((p) => p.ESTADO === "IMPAGA");
    const displayData = (viewMode === "vencimientos" ? polizas : impagas).filter(
        (p) => !hiddenIds.has(p.id || p.CODIGO)
    );
    const labels = viewLabels[viewMode];

    const handleNotify = async (poliza: Poliza) => {
        setNotifyingId(poliza.CODIGO);
        try {
            const result = await sendNotification(poliza);
            if (result.success) {
                setNotifiedIds((prev) => new Set([...prev, poliza.CODIGO]));
            }
        } finally {
            setNotifyingId(null);
        }
    };

    const handleMarkNotified = (poliza: Poliza) => {
        const id = poliza.id || poliza.CODIGO;
        setNotifiedIds((prev) => new Set([...prev, id]));
        // Wait for animation before removing from list
        setTimeout(() => {
            setHiddenIds((prev) => new Set([...prev, id]));
        }, 500);
    };

    const getDaysLabel = (days: number) => {
        if (days === 0) return "Hoy";
        if (days === 1) return "Mañana";
        return `${days} días`;
    };

    const getDaysColor = (days: number) => {
        if (days <= 3) return "text-red-600 bg-red-50";
        if (days <= 10) return "text-amber-600 bg-amber-50";
        return "text-blue-600 bg-blue-50";
    };

    return (
        <Card className="border-zinc-200">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-500" />

                        {/* Dropdown to switch view mode */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-100">
                                    {labels.title}
                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() => setViewMode("vencimientos")}
                                    className={`gap-2 ${viewMode === "vencimientos" ? "font-semibold" : ""}`}
                                >
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Alertas de Vencimiento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setViewMode("impagas")}
                                    className={`gap-2 ${viewMode === "impagas" ? "font-semibold" : ""}`}
                                >
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    Pólizas Impagas
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                        {labels.badge} · {displayData.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                {loading ? (
                    <TableSkeleton />
                ) : displayData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-400" />
                        <p className="text-base font-medium text-zinc-600">
                            {viewMode === "vencimientos"
                                ? "Sin vencimientos próximos"
                                : "Sin pólizas impagas"}
                        </p>
                        <p className="text-sm text-zinc-400">
                            {viewMode === "vencimientos"
                                ? "No hay pólizas que venzan en los próximos 30 días"
                                : "Todas las pólizas están al día"}
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-auto">
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[55%]">
                                        Detalle de Póliza
                                    </TableHead>
                                    <TableHead className="pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[45%]">
                                        Vencimiento y Acción
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayData.map((poliza) => {
                                    const days = daysUntil(poliza.VENCIMIENTO);
                                    const id = poliza.id || poliza.CODIGO;
                                    const isNotified = notifiedIds.has(id);

                                    return (
                                        <TableRow
                                            key={id}
                                            className={`group transition-all duration-500 ease-in-out hover:bg-zinc-50/50 ${isNotified ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
                                                }`}
                                        >
                                            <TableCell className="pl-4 py-3 align-top">
                                                <div className="flex flex-col gap-1 pt-1">
                                                    <p className="text-[13px] font-semibold text-zinc-900 leading-tight">
                                                        {poliza.ASEGURADO}
                                                    </p>
                                                    <div className="flex flex-col gap-0.5 text-[12px] font-medium text-zinc-500">
                                                        <span className="text-zinc-600 truncate">{poliza.COMPAÑIA}</span>
                                                        <span className="font-mono text-zinc-500 text-[11px] truncate">Pól: {poliza.POLIZA}</span>
                                                        <span className="text-zinc-700">{formatCurrency(poliza.COSTO_MENSUAL)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-4 py-3 align-top">
                                                <div className="flex flex-col items-end gap-2">
                                                    {viewMode === "vencimientos" ? (
                                                        <div
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getDaysColor(days)}`}
                                                        >
                                                            {days <= 3 && (
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                            )}
                                                            {getDaysLabel(days)}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                                            {poliza.VENCIMIENTO}
                                                        </span>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant={isNotified ? "default" : "outline"}
                                                        onClick={() => handleMarkNotified(poliza)}
                                                        disabled={isNotified}
                                                        className={`h-7 px-2 gap-1.5 text-[11px] max-w-full transition-colors ${isNotified
                                                                ? "bg-emerald-500 text-white hover:bg-emerald-600 border-none"
                                                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                            }`}
                                                    >
                                                        {isNotified ? (
                                                            <>
                                                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">Listo</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Bell className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">Marcar Notificado</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

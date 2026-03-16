"use client";

import { useState, useEffect } from "react";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Poliza } from "@/lib/types";
import { formatCurrency, daysUntil, getNextExpiration, parseDate } from "@/lib/utils";
import { sendNotification, updatePolizaFull } from "@/lib/api";

interface AlertsTableProps {
    polizas: Poliza[];
    allPolizas: Poliza[];
    loading?: boolean;
    onUpdated?: (updatedPoliza: Poliza) => void;
}

type ViewMode = "vencimientos" | "impagas";

const viewLabels: Record<ViewMode, { title: string; badge: string }> = {
    vencimientos: {
        title: "Alertas de Vencimiento",
        badge: "Atrasadas + próximos 30 días",
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
                    <div className="h-6 w-20 rounded bg-[#59CBE8]/10" />
                    <div className="h-6 w-40 rounded bg-[#59CBE8]/10" />
                    <div className="h-6 w-28 rounded bg-[#59CBE8]/10" />
                    <div className="h-6 w-32 rounded bg-[#59CBE8]/10" />
                    <div className="h-6 w-24 rounded bg-[#59CBE8]/10" />
                    <div className="ml-auto h-9 w-24 rounded bg-[#59CBE8]/10" />
                </div>
            ))}
        </div>
    );
}

export function AlertsTable({ polizas, allPolizas, loading, onUpdated }: AlertsTableProps) {
    const [notifyingId, setNotifyingId] = useState<string | null>(null);
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>("vencimientos");
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);

    const [confirmPoliza, setConfirmPoliza] = useState<Poliza | null>(null);
    const [editForm, setEditForm] = useState<{ POLIZA: string; VENCIMIENTO: string }>({ POLIZA: "", VENCIMIENTO: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("omniseguros_hidden_alerts");
        if (stored) {
            try {
                setHiddenIds(new Set(JSON.parse(stored)));
            } catch (e) {
                console.error("Error parsing hidden alerts from local storage", e);
            }
        }
    }, []);

    const impagas = allPolizas.filter((p) => p.ESTADO === "IMPAGA");
    const displayData = (viewMode === "vencimientos" ? polizas : impagas).filter((p) => {
        if (!mounted) return true;
        // Use the actual parsed expiration date for a stable key
        const expirationDate = parseDate(p.VENCIMIENTO);
        const alertKey = `${p.id || p.CODIGO}_${expirationDate.getMonth()}_${expirationDate.getFullYear()}`;
        return !hiddenIds.has(alertKey);
    });
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
        // Stable key: uses the actual parsed expiration date, not a rolling monthly one
        const expirationDate = parseDate(poliza.VENCIMIENTO);
        const alertKey = `${id}_${expirationDate.getMonth()}_${expirationDate.getFullYear()}`;

        setNotifiedIds((prev) => new Set([...prev, id]));
        // Wait for animation before removing from list
        setTimeout(() => {
            setHiddenIds((prev) => {
                const next = new Set([...prev, alertKey]);
                localStorage.setItem("omniseguros_hidden_alerts", JSON.stringify(Array.from(next)));
                return next;
            });
        }, 500);
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setEditForm((prev) => ({ ...prev, VENCIMIENTO: format(date, "dd/MM/yyyy") }));
        } else {
            setEditForm((prev) => ({ ...prev, VENCIMIENTO: "" }));
        }
    };

    const handleSaveAndNotify = async () => {
        if (!confirmPoliza) return;
        setIsSubmitting(true);
        try {
            const result = await updatePolizaFull(confirmPoliza.id || confirmPoliza.CODIGO, {
                POLIZA: editForm.POLIZA,
                VENCIMIENTO: editForm.VENCIMIENTO
            });
            if (result.success) {
                const updatedPoliza: Poliza = {
                    ...confirmPoliza,
                    POLIZA: editForm.POLIZA,
                    VENCIMIENTO: editForm.VENCIMIENTO
                } as Poliza;
                if (onUpdated) onUpdated(updatedPoliza);
                handleMarkNotified(updatedPoliza);
                setConfirmPoliza(null);
            }
        } catch (error) {
            console.error("Error updating poliza:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDaysLabel = (days: number) => {
        if (days < 0) return `Venc. hace ${Math.abs(days)} días`;
        if (days === 0) return "Hoy";
        if (days === 1) return "Mañana";
        return `${days} días`;
    };

    const getDaysColor = (days: number) => {
        if (days < 0) return "text-red-700 bg-red-100";
        if (days <= 3) return "text-red-600 bg-red-50";
        if (days <= 10) return "text-amber-600 bg-amber-50";
        return "text-blue-600 bg-blue-50";
    };

    return (
        <Card className="border-[#59CBE8]/30 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-500 hover:shadow-md">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[#59CBE8]/10">
                            <Clock className="h-4 w-4 text-[#59CBE8]" />
                        </div>

                        {/* Dropdown to switch view mode */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-base font-semibold text-zinc-900 transition-colors hover:text-[#59CBE8] hover:bg-[#59CBE8]/5">
                                    {labels.title}
                                    <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-[#59CBE8]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="border-[#59CBE8]/20">
                                <DropdownMenuItem
                                    onClick={() => setViewMode("vencimientos")}
                                    className={`gap-2 focus:bg-[#59CBE8]/10 focus:text-[#59CBE8] ${viewMode === "vencimientos" ? "font-bold text-[#59CBE8]" : ""}`}
                                >
                                    <Clock className="h-4 w-4" />
                                    Alertas de Vencimiento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setViewMode("impagas")}
                                    className={`gap-2 focus:bg-[#59CBE8]/10 focus:text-[#59CBE8] ${viewMode === "impagas" ? "font-bold text-[#59CBE8]" : ""}`}
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    Pólizas Impagas
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-bold border-[#59CBE8]/30 bg-[#59CBE8]/5 text-[#59CBE8] uppercase tracking-wider">
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
                    <div className="max-h-[320px] overflow-y-auto overflow-x-auto">
                        <Table className="table-fixed w-full min-w-[450px]">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className=" h-8 pl-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[55%]">
                                        Detalle de Póliza
                                    </TableHead>
                                    <TableHead className=" h-8 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-500 w-[45%]">
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
                                            className={`group transition-all duration-500 ease-in-out hover:bg-[#59CBE8]/5 ${isNotified ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
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
                                                            {(days < 0 || days <= 3) && (
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
                                                        onClick={() => {
                                                            setConfirmPoliza(poliza);
                                                            setEditForm({ POLIZA: poliza.POLIZA || "", VENCIMIENTO: poliza.VENCIMIENTO || "" });
                                                        }}
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
            <Dialog open={!!confirmPoliza} onOpenChange={(open) => !open && setConfirmPoliza(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Mantenimiento de Póliza</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                        <p className="text-sm text-zinc-600">
                            Has marcado a <span className="font-semibold text-zinc-900">{confirmPoliza?.ASEGURADO}</span>.
                            ¿Deseás actualizar el número de póliza o la fecha de vencimiento antes de ocultar la alerta mensual?
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm">Nro. Póliza</Label>
                                <Input
                                    value={editForm.POLIZA}
                                    onChange={(e) => setEditForm({ ...editForm, POLIZA: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5 flex flex-col pt-1">
                                <Label className="text-sm">Vencimiento</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !editForm.VENCIMIENTO && "text-zinc-500"
                                            )}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar mr-2 h-4 w-4"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
                                            {editForm.VENCIMIENTO || <span>Elegir</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={editForm.VENCIMIENTO ? new Date(editForm.VENCIMIENTO.split('/').reverse().join('-')) : undefined}
                                            onSelect={handleDateChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between pt-4">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto text-zinc-600"
                            onClick={() => {
                                if (confirmPoliza) handleMarkNotified(confirmPoliza);
                                setConfirmPoliza(null);
                            }}
                        >
                            Solo ocultar alerta
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            onClick={handleSaveAndNotify}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Actualizar y Ocultar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Poliza } from "@/lib/types";
import { formatCurrency, getEstadoStyle, daysUntil } from "@/lib/utils";
import {
    User,
    Phone,
    Calendar,
    Building2,
    FileText,
    Shield,
    DollarSign,
    Clock,
    MessageSquare,
    Hash,
} from "lucide-react";

interface PolizaDetailModalProps {
    poliza: Poliza | null;
    open: boolean;
    onClose: () => void;
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    {label}
                </p>
                <div className="mt-0.5 text-sm font-medium text-zinc-900">{value}</div>
            </div>
        </div>
    );
}

export function PolizaDetailModal({
    poliza,
    open,
    onClose,
}: PolizaDetailModalProps) {
    if (!poliza) return null;

    const estadoStyle = getEstadoStyle(poliza.ESTADO);
    const days = daysUntil(poliza.VENCIMIENTO);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold text-zinc-900">
                            Detalle de Póliza
                        </DialogTitle>
                        <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${estadoStyle.className}`}
                        >
                            {estadoStyle.label}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Asegurado */}
                <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Datos del Asegurado
                    </h3>
                    <Separator className="mb-2" />
                    <div className="grid gap-0 sm:grid-cols-2">
                        <InfoRow
                            icon={User}
                            label="Asegurado"
                            value={poliza.ASEGURADO}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Teléfono"
                            value={poliza.TELEFONO}
                        />
                        <InfoRow
                            icon={Hash}
                            label="Código"
                            value={
                                <span className="font-mono">{poliza.CODIGO}</span>
                            }
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Fecha de Alta"
                            value={poliza.FECHA}
                        />
                    </div>
                </div>

                {/* Póliza */}
                <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Datos de la Póliza
                    </h3>
                    <Separator className="mb-2" />
                    <div className="grid gap-0 sm:grid-cols-2">
                        <InfoRow
                            icon={Building2}
                            label="Compañía"
                            value={poliza.COMPAÑIA}
                        />
                        <InfoRow
                            icon={FileText}
                            label="Nro. Póliza"
                            value={
                                <span className="font-mono">{poliza.POLIZA}</span>
                            }
                        />
                        <InfoRow
                            icon={Shield}
                            label="Cobertura"
                            value={poliza.COBERTURA}
                        />
                        <InfoRow
                            icon={Clock}
                            label="Vencimiento"
                            value={
                                <span className="flex items-center gap-2">
                                    {poliza.VENCIMIENTO}
                                    {days >= 0 && (
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] ${days <= 7
                                                    ? "border-red-200 bg-red-50 text-red-600"
                                                    : days <= 30
                                                        ? "border-amber-200 bg-amber-50 text-amber-600"
                                                        : "border-blue-200 bg-blue-50 text-blue-600"
                                                }`}
                                        >
                                            {days === 0 ? "Hoy" : `${days}d`}
                                        </Badge>
                                    )}
                                </span>
                            }
                        />
                    </div>
                </div>

                {/* Financiero */}
                <div>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Información Financiera
                    </h3>
                    <Separator className="mb-2" />
                    <div className="grid gap-0 sm:grid-cols-2">
                        <InfoRow
                            icon={DollarSign}
                            label="Costo Mensual"
                            value={
                                <span className="text-base font-bold text-zinc-900">
                                    {formatCurrency(poliza.COSTO_MENSUAL)}
                                </span>
                            }
                        />
                        <InfoRow
                            icon={FileText}
                            label="Referencias"
                            value={poliza.REFERENCIAS || "—"}
                        />
                    </div>
                </div>

                {/* Observaciones */}
                {poliza.OBSERVACION && (
                    <div>
                        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Observaciones
                        </h3>
                        <Separator className="mb-2" />
                        <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <p className="text-sm text-amber-800">{poliza.OBSERVACION}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

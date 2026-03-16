"use client";

import { useState, FormEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Cotizacion } from "@/lib/types";
import { createCotizacion } from "@/lib/api";

interface NuevaCotizacionModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (cotizacion: Cotizacion) => void;
}

const emptyForm = {
    nombre_cliente: "",
    telefono_cliente: "",
    ramo: "",
    companias_cotizadas: "",
    estado: "PENDIENTE" as Cotizacion["estado"],
    observacion: "",
};

const RAMOS = [
    "Automotor",
    "Hogar",
    "Vida",
    "Accidentes Personales",
    "Comercio",
    "ART",
    "Salud",
    "Sepelio",
    "Transporte",
    "Otro",
];

export function NuevaCotizacionModal({ open, onClose, onCreated }: NuevaCotizacionModalProps) {
    const [form, setForm] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.nombre_cliente || !form.ramo || !form.companias_cotizadas) {
            setError("Los campos Nombre del Cliente, Ramo y Compañías cotizadas son obligatorios.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createCotizacion({
                nombre_cliente: form.nombre_cliente.trim(),
                telefono_cliente: form.telefono_cliente.trim(),
                ramo: form.ramo,
                companias_cotizadas: form.companias_cotizadas.trim(),
                estado: form.estado,
                observacion: form.observacion.trim(),
            });

            if (result.success) {
                const newCotizacion: Cotizacion = {
                    id: result.id,
                    ...form,
                    created_at: new Date().toISOString(),
                };
                onCreated(newCotizacion);
                setForm(emptyForm);
                onClose();
            } else {
                setError(result.message || "Error al guardar la cotización.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm(emptyForm);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[560px] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                        <Plus className="h-5 w-5 text-blue-600" />
                        Nueva Cotización
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                    {/* Datos del Cliente */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Datos del Cliente
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="nombre_cliente" className="text-sm">Nombre completo *</Label>
                                <Input
                                    id="nombre_cliente"
                                    placeholder="Juan Pérez"
                                    value={form.nombre_cliente}
                                    onChange={(e) => handleChange("nombre_cliente", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="telefono_cliente" className="text-sm">Teléfono</Label>
                                <Input
                                    id="telefono_cliente"
                                    placeholder="+5492614001234"
                                    value={form.telefono_cliente}
                                    onChange={(e) => handleChange("telefono_cliente", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ramo Cotizado */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Ramo Cotizado
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="ramo" className="text-sm">Ramo *</Label>
                            <Select value={form.ramo} onValueChange={(v) => handleChange("ramo", v)}>
                                <SelectTrigger id="ramo">
                                    <SelectValue placeholder="Seleccioná un ramo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAMOS.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Compañías Cotizadas */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Compañías Cotizadas
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="companias_cotizadas" className="text-sm">Compañías *</Label>
                            <Input
                                id="companias_cotizadas"
                                placeholder="Ej: Sancor, Zurich, Federación Patronal"
                                value={form.companias_cotizadas}
                                onChange={(e) => handleChange("companias_cotizadas", e.target.value)}
                                required
                            />
                            <p className="text-xs text-zinc-400">Separalas con comas si cotizaste varias.</p>
                        </div>
                    </div>

                    {/* Estado */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Resultado de la Cotización
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="estado" className="text-sm">Estado</Label>
                            <Select value={form.estado} onValueChange={(v) => handleChange("estado", v)}>
                                <SelectTrigger id="estado">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                    <SelectItem value="VENDIDO">✅ Vendido</SelectItem>
                                    <SelectItem value="NO_VENDIDO">❌ No Vendido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-1.5">
                        <Label htmlFor="observacion" className="text-sm">Observaciones</Label>
                        <Textarea
                            id="observacion"
                            placeholder="Notas adicionales sobre la cotización..."
                            value={form.observacion}
                            onChange={(e) => handleChange("observacion", e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Guardar Cotización
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

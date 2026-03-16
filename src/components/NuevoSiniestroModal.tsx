"use client";

import { useState, FormEvent } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Siniestro } from "@/lib/types";
import { createSiniestro } from "@/lib/api";

interface NuevoSiniestroModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (siniestro: Siniestro) => void;
}

const emptyForm = {
    nombre_cliente: "",
    telefono_cliente: "",
    ramo: "",
    compania: "",
    resuelto: false,
    fecha_resolucion: "",
    nota: "",
};

const RAMOS = [
    "Automotor", "Hogar", "Vida", "Accidentes Personales",
    "Comercio", "ART", "Salud", "Sepelio", "Transporte", "Otro",
];

export function NuevoSiniestroModal({ open, onClose, onCreated }: NuevoSiniestroModalProps) {
    const [form, setForm] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.nombre_cliente || !form.ramo || !form.compania) {
            setError("Nombre del cliente, Ramo y Compañía son obligatorios.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createSiniestro({
                nombre_cliente: form.nombre_cliente.trim(),
                telefono_cliente: form.telefono_cliente.trim(),
                ramo: form.ramo,
                compania: form.compania.trim(),
                resuelto: form.resuelto,
                fecha_resolucion: form.fecha_resolucion.trim() || undefined,
                nota: form.nota.trim(),
            });

            if (result.success) {
                onCreated({
                    id: result.id,
                    ...form,
                    created_at: new Date().toISOString(),
                });
                setForm(emptyForm);
                onClose();
            } else {
                setError(result.message || "Error al guardar el siniestro.");
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
                        <Plus className="h-5 w-5 text-orange-600" />
                        Cargar Siniestro
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-1">
                    {/* Cliente */}
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

                    {/* Ramo y Compañía */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Siniestro
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
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
                            <div className="space-y-1.5">
                                <Label htmlFor="compania" className="text-sm">Compañía *</Label>
                                <Input
                                    id="compania"
                                    placeholder="Ej: Sancor Seguros"
                                    value={form.compania}
                                    onChange={(e) => handleChange("compania", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Estado y Fecha Resolución */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Estado
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="resuelto" className="text-sm">Resuelto</Label>
                                <Select
                                    value={form.resuelto ? "true" : "false"}
                                    onValueChange={(v) => handleChange("resuelto", v === "true")}
                                >
                                    <SelectTrigger id="resuelto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">Pendiente</SelectItem>
                                        <SelectItem value="true">Resuelto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="fecha_resolucion" className="text-sm">Fecha de Resolución</Label>
                                <Input
                                    id="fecha_resolucion"
                                    type="date"
                                    value={form.fecha_resolucion}
                                    onChange={(e) => handleChange("fecha_resolucion", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nota */}
                    <div className="space-y-1.5">
                        <Label htmlFor="nota" className="text-sm">Nota</Label>
                        <Textarea
                            id="nota"
                            placeholder="Descripción del siniestro, observaciones..."
                            value={form.nota}
                            onChange={(e) => handleChange("nota", e.target.value)}
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
                            className="gap-2 bg-orange-600 hover:bg-orange-700"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Guardar Siniestro
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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
import { Loader2, Plus, CalendarIcon } from "lucide-react";
import { Poliza } from "@/lib/types";
import { createPoliza } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface NewPolizaModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (poliza: Poliza) => void;
}

const emptyForm = {
    ESTADO: "VIGENTE" as Poliza["ESTADO"],
    TELEFONO: "",
    FECHA: "",
    ASEGURADO: "",
    COMPAÑIA: "",
    POLIZA: "",
    COBERTURA: "",
    VENCIMIENTO: "",
    REFERENCIAS: "",
    COSTO_MENSUAL: "",
    OBSERVACION: "",
};

export function NewPolizaModal({
    open,
    onClose,
    onCreated,
}: NewPolizaModalProps) {
    const [form, setForm] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        field: string,
        value: string
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (field: string, date: Date | undefined) => {
        if (date) {
            setForm((prev) => ({ ...prev, [field]: format(date, "dd/MM/yyyy") }));
        } else {
            setForm((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.ASEGURADO || !form.COMPAÑIA || !form.POLIZA) return;

        setIsSubmitting(true);
        try {
            const polizaData: Omit<Poliza, "CODIGO"> = {
                ...form,
                COSTO_MENSUAL: parseFloat(form.COSTO_MENSUAL) || 0,
            };
            const result = await createPoliza(polizaData);
            if (result.success) {
                const newPoliza: Poliza = {
                    ...polizaData,
                    CODIGO: result.codigo || `POL-${Date.now()}`,
                };
                onCreated(newPoliza);
                setForm(emptyForm);
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm(emptyForm);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                        <Plus className="h-5 w-5 text-blue-600" />
                        Nuevo Cliente / Póliza
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Datos del Asegurado */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Datos del Asegurado
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="asegurado" className="text-sm">
                                    Nombre completo *
                                </Label>
                                <Input
                                    id="asegurado"
                                    placeholder="Juan Carlos Méndez"
                                    value={form.ASEGURADO}
                                    onChange={(e) => handleChange("ASEGURADO", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="telefono" className="text-sm">
                                    Teléfono
                                </Label>
                                <Input
                                    id="telefono"
                                    placeholder="+5492614001234"
                                    value={form.TELEFONO}
                                    onChange={(e) => handleChange("TELEFONO", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Datos de la Póliza */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Datos de la Póliza
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="compania" className="text-sm">
                                    Compañía *
                                </Label>
                                <Input
                                    id="compania"
                                    placeholder="Sancor Seguros"
                                    value={form.COMPAÑIA}
                                    onChange={(e) => handleChange("COMPAÑIA", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="poliza" className="text-sm">
                                    Nro. Póliza *
                                </Label>
                                <Input
                                    id="poliza"
                                    placeholder="AU-2025-00142"
                                    value={form.POLIZA}
                                    onChange={(e) => handleChange("POLIZA", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="cobertura" className="text-sm">
                                    Cobertura
                                </Label>
                                <Input
                                    id="cobertura"
                                    placeholder="Todo Riesgo con Franquicia"
                                    value={form.COBERTURA}
                                    onChange={(e) => handleChange("COBERTURA", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="estado" className="text-sm">
                                    Estado
                                </Label>
                                <Select
                                    value={form.ESTADO}
                                    onValueChange={(val) => handleChange("ESTADO", val)}
                                >
                                    <SelectTrigger id="estado">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIGENTE">Vigente</SelectItem>
                                        <SelectItem value="IMPAGA">Impaga</SelectItem>
                                        <SelectItem value="A RENOVAR">A Renovar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 flex flex-col pt-1">
                                <Label htmlFor="fecha" className="text-sm">
                                    Fecha de Alta
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !form.FECHA && "text-zinc-500"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.FECHA ? form.FECHA : <span>Elegir fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={form.FECHA ? new Date(form.FECHA.split('/').reverse().join('-')) : undefined}
                                            onSelect={(date) => handleDateChange("FECHA", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1.5 flex flex-col pt-1">
                                <Label htmlFor="vencimiento" className="text-sm">
                                    Vencimiento
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !form.VENCIMIENTO && "text-zinc-500"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.VENCIMIENTO ? form.VENCIMIENTO : <span>Elegir fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={form.VENCIMIENTO ? new Date(form.VENCIMIENTO.split('/').reverse().join('-')) : undefined}
                                            onSelect={(date) => handleDateChange("VENCIMIENTO", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Financiero */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Información Financiera
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="costo" className="text-sm">
                                    Costo Mensual
                                </Label>
                                <Input
                                    id="costo"
                                    type="number"
                                    placeholder="45000"
                                    value={form.COSTO_MENSUAL}
                                    onChange={(e) => handleChange("COSTO_MENSUAL", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="referencias" className="text-sm">
                                    Referencias
                                </Label>
                                <Input
                                    id="referencias"
                                    placeholder="Renovación automática"
                                    value={form.REFERENCIAS}
                                    onChange={(e) => handleChange("REFERENCIAS", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-1.5">
                        <Label htmlFor="observacion" className="text-sm">
                            Observaciones
                        </Label>
                        <Textarea
                            id="observacion"
                            placeholder="Notas adicionales sobre el cliente o póliza..."
                            value={form.OBSERVACION}
                            onChange={(e) => handleChange("OBSERVACION", e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !form.ASEGURADO || !form.COMPAÑIA || !form.POLIZA}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Crear Póliza
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, FormEvent, useMemo } from "react";
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
import { Loader2, Save, CalendarIcon, Search, UserCog } from "lucide-react";
import { Poliza } from "@/lib/types";
import { updatePolizaFull } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface EditClienteModalProps {
    open: boolean;
    onClose: () => void;
    polizas: Poliza[];
    onUpdated: (updatedPoliza: Poliza) => void;
}

export function EditClienteModal({
    open,
    onClose,
    polizas,
    onUpdated,
}: EditClienteModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(null);
    const [form, setForm] = useState<Partial<Poliza>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrado simple por nombre o numero de poliza
    const filteredPolizas = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return polizas
            .filter(
                (p) =>
                    p.ASEGURADO?.toLowerCase().includes(term) ||
                    p.POLIZA?.toLowerCase().includes(term)
            )
            .slice(0, 10); // Mostrar maximo 10 resultados para no saturar
    }, [searchTerm, polizas]);

    const handleSelect = (poliza: Poliza) => {
        setSelectedPoliza(poliza);
        setForm({ ...poliza });
        setSearchTerm("");
    };

    const handleChange = (field: keyof Poliza, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (field: keyof Poliza, date: Date | undefined) => {
        if (date) {
            setForm((prev) => ({ ...prev, [field]: format(date, "dd/MM/yyyy") }));
        } else {
            setForm((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedPoliza || !form.ASEGURADO || !form.COMPAÑIA || !form.POLIZA) return;

        setIsSubmitting(true);
        try {
            const polizaData: Partial<Poliza> = {
                ...form,
                COSTO_MENSUAL: typeof form.COSTO_MENSUAL === "string" ? parseFloat(form.COSTO_MENSUAL) || 0 : form.COSTO_MENSUAL,
            };

            const result = await updatePolizaFull(selectedPoliza.CODIGO, polizaData);
            if (result.success) {
                const finalPoliza: Poliza = {
                    ...selectedPoliza,
                    ...polizaData,
                } as Poliza;
                onUpdated(finalPoliza);
                handleClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSearchTerm("");
        setSelectedPoliza(null);
        setForm({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-[640px] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                        <UserCog className="h-5 w-5 text-blue-600" />
                        Modificar Cliente / Póliza
                    </DialogTitle>
                </DialogHeader>

                {!selectedPoliza ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Buscar Cliente o Nro. Póliza</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    id="search"
                                    placeholder="Ej: Juan Perez o AU-2025..."
                                    className="pl-9"
                                    autoComplete="off"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {searchTerm.trim() !== "" && (
                            <div className="rounded-md border border-zinc-200 divide-y divide-zinc-100 max-h-60 overflow-y-auto">
                                {filteredPolizas.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-500">
                                        No se encontraron resultados
                                    </div>
                                ) : (
                                    filteredPolizas.map((p) => (
                                        <button
                                            key={p.CODIGO}
                                            type="button"
                                            className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex flex-col gap-1 transition-colors"
                                            onClick={() => handleSelect(p)}
                                        >
                                            <span className="text-sm font-semibold text-zinc-900">
                                                {p.ASEGURADO}
                                            </span>
                                            <span className="text-xs font-medium text-zinc-500">
                                                {p.COMPAÑIA} • Póliza: {p.POLIZA}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                        <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 rounded-md border border-zinc-200">
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">{selectedPoliza.ASEGURADO}</p>
                                <p className="text-xs text-zinc-500">Editando póliza {selectedPoliza.POLIZA}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPoliza(null)}
                                className="text-xs h-7"
                            >
                                Cambiar
                            </Button>
                        </div>

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
                                        value={form.ASEGURADO || ""}
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
                                        value={form.TELEFONO || ""}
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
                                        value={form.COMPAÑIA || ""}
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
                                        value={form.POLIZA || ""}
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
                                        value={form.COBERTURA || ""}
                                        onChange={(e) => handleChange("COBERTURA", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="estado" className="text-sm">
                                        Estado
                                    </Label>
                                    <Select
                                        value={form.ESTADO || ""}
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
                                        value={form.COSTO_MENSUAL || ""}
                                        onChange={(e) => handleChange("COSTO_MENSUAL", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="referencias" className="text-sm">
                                        Referencias
                                    </Label>
                                    <Input
                                        id="referencias"
                                        value={form.REFERENCIAS || ""}
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
                                value={form.OBSERVACION || ""}
                                onChange={(e) => handleChange("OBSERVACION", e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>

                        <DialogFooter className="pt-2">
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
                                    <Save className="h-4 w-4" />
                                )}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Filter,
    Plus,
    Eye,
    ChevronDown,
    ClipboardList,
    Loader2,
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Poliza } from "@/lib/types";
import { formatCurrency, getEstadoStyle } from "@/lib/utils";
import { updatePolizaEstado } from "@/lib/api";
import { PolizaDetailModal } from "./PolizaDetailModal";
import { NewPolizaModal } from "./NewPolizaModal";

interface PolizasTableProps {
    polizas: Poliza[];
    onPolizasChange: (polizas: Poliza[]) => void;
    loading?: boolean;
}

export function PolizasTable({
    polizas,
    onPolizasChange,
    loading,
}: PolizasTableProps) {
    const [search, setSearch] = useState("");
    const [filterEstado, setFilterEstado] = useState<string>("TODOS");
    const [filterCompania, setFilterCompania] = useState<string>("TODAS");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [detailPoliza, setDetailPoliza] = useState<Poliza | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);

    // Get unique companies for filter
    const companies = useMemo(() => {
        const set = new Set(polizas.map((p) => p.COMPAÑIA));
        return Array.from(set).sort();
    }, [polizas]);

    // Filter and search
    const filtered = useMemo(() => {
        return polizas.filter((p) => {
            const matchSearch =
                !search ||
                p.ASEGURADO.toLowerCase().includes(search.toLowerCase()) ||
                p.POLIZA.toLowerCase().includes(search.toLowerCase()) ||
                p.CODIGO.toLowerCase().includes(search.toLowerCase()) ||
                p.TELEFONO.includes(search);

            const matchEstado =
                filterEstado === "TODOS" || p.ESTADO === filterEstado;

            const matchCompania =
                filterCompania === "TODAS" || p.COMPAÑIA === filterCompania;

            return matchSearch && matchEstado && matchCompania;
        });
    }, [polizas, search, filterEstado, filterCompania]);

    const handleEstadoChange = async (
        poliza: Poliza,
        nuevoEstado: Poliza["ESTADO"]
    ) => {
        if (nuevoEstado === poliza.ESTADO) return;
        setUpdatingId(poliza.POLIZA);
        try {
            const result = await updatePolizaEstado(poliza.POLIZA, nuevoEstado);
            if (result.success) {
                const updated = polizas.map((p) =>
                    p.POLIZA === poliza.POLIZA ? { ...p, ESTADO: nuevoEstado } : p
                );
                onPolizasChange(updated);
            }
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePolizaCreated = (newPoliza: Poliza) => {
        onPolizasChange([...polizas, newPoliza]);
    };

    if (loading) {
        return (
            <Card className="border-zinc-200">
                <CardContent className="p-8">
                    <div className="flex items-center justify-center gap-3 text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Cargando pólizas...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-zinc-200">
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-base font-semibold text-zinc-900">
                                Todas las Pólizas
                            </CardTitle>
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {filtered.length} de {polizas.length}
                            </Badge>
                        </div>
                        <Button
                            onClick={() => setShowNewModal(true)}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                                placeholder="Buscar por nombre, póliza, código o teléfono..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5">
                                <Filter className="h-3.5 w-3.5 text-zinc-400" />
                                <Select
                                    value={filterEstado}
                                    onValueChange={setFilterEstado}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos</SelectItem>
                                        <SelectItem value="VIGENTE">Vigente</SelectItem>
                                        <SelectItem value="IMPAGA">Impaga</SelectItem>
                                        <SelectItem value="A RENOVAR">A Renovar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Select
                                value={filterCompania}
                                onValueChange={setFilterCompania}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Compañía" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODAS">Todas</SelectItem>
                                    {companies.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-0 pb-0">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Search className="mb-3 h-10 w-10 text-zinc-300" />
                            <p className="text-sm font-medium text-zinc-600">
                                Sin resultados
                            </p>
                            <p className="text-xs text-zinc-400">
                                No se encontraron pólizas con los filtros actuales
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Estado
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Código
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Asegurado
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Compañía
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Póliza
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Cobertura
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Vencimiento
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Costo Mensual
                                        </TableHead>
                                        <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Acciones
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((poliza) => {
                                        const estadoStyle = getEstadoStyle(poliza.ESTADO);
                                        const isUpdating = updatingId === poliza.POLIZA;

                                        return (
                                            <TableRow
                                                key={poliza.CODIGO}
                                                className="group transition-colors hover:bg-zinc-50/50"
                                            >
                                                {/* Estado Dropdown */}
                                                <TableCell className="pl-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild disabled={isUpdating}>
                                                            <button className="inline-flex items-center gap-1 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50">
                                                                {isUpdating ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                                                                ) : (
                                                                    <>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`text-[11px] font-medium ${estadoStyle.className}`}
                                                                        >
                                                                            {estadoStyle.label}
                                                                        </Badge>
                                                                        <ChevronDown className="h-3 w-3 text-zinc-400" />
                                                                    </>
                                                                )}
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEstadoChange(poliza, "VIGENTE")
                                                                }
                                                                className="gap-2"
                                                            >
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                Vigente
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEstadoChange(poliza, "IMPAGA")
                                                                }
                                                                className="gap-2"
                                                            >
                                                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                                                Impaga
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEstadoChange(poliza, "A RENOVAR")
                                                                }
                                                                className="gap-2"
                                                            >
                                                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                                A Renovar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>

                                                <TableCell className="font-mono text-xs text-zinc-500">
                                                    {poliza.CODIGO}
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm font-medium text-zinc-900">
                                                        {poliza.ASEGURADO}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-sm text-zinc-600">
                                                    {poliza.COMPAÑIA}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-zinc-600">
                                                    {poliza.POLIZA}
                                                </TableCell>
                                                <TableCell className="text-sm text-zinc-500">
                                                    {poliza.COBERTURA}
                                                </TableCell>
                                                <TableCell className="text-sm text-zinc-600">
                                                    {poliza.VENCIMIENTO}
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold text-zinc-900">
                                                    {formatCurrency(poliza.COSTO_MENSUAL)}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setDetailPoliza(poliza)}
                                                        className="gap-1.5 text-zinc-500 hover:text-blue-600"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detalle
                                                    </Button>
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

            {/* Detail Modal */}
            <PolizaDetailModal
                poliza={detailPoliza}
                open={!!detailPoliza}
                onClose={() => setDetailPoliza(null)}
            />

            {/* New Poliza Modal */}
            <NewPolizaModal
                open={showNewModal}
                onClose={() => setShowNewModal(false)}
                onCreated={handlePolizaCreated}
            />
        </>
    );
}

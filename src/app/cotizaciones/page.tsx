"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { AiChatWidget } from "@/components/AiChatWidget";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { NuevaCotizacionModal } from "@/components/NuevaCotizacionModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    ArrowLeft,
    Plus,
    Search,
    TrendingUp,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    Loader2,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { Cotizacion } from "@/lib/types";
import { fetchCotizaciones, updateCotizacion, deleteCotizacion } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ESTADO_CONFIG: Record<
    Cotizacion["estado"],
    { label: string; className: string; icon: React.ReactNode }
> = {
    VENDIDO: {
        label: "Vendido",
        className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    NO_VENDIDO: {
        label: "No Vendido",
        className: "bg-red-500/15 text-red-700 border-red-500/25",
        icon: <XCircle className="h-3.5 w-3.5" />,
    },
    PENDIENTE: {
        label: "Pendiente",
        className: "bg-amber-500/15 text-amber-700 border-amber-500/25",
        icon: <Clock className="h-3.5 w-3.5" />,
    },
};

export default function CotizacionesPage() {
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filterEstado, setFilterEstado] = useState("TODOS");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCotizaciones().then((data) => {
            setCotizaciones(data);
            setLoading(false);
        });
    }, []);

    const filtered = useMemo(() => {
        return cotizaciones.filter((c) => {
            const matchSearch =
                !search ||
                c.nombre_cliente.toLowerCase().includes(search.toLowerCase()) ||
                c.ramo.toLowerCase().includes(search.toLowerCase()) ||
                c.companias_cotizadas.toLowerCase().includes(search.toLowerCase());
            const matchEstado = filterEstado === "TODOS" || c.estado === filterEstado;
            return matchSearch && matchEstado;
        });
    }, [cotizaciones, search, filterEstado]);

    // KPIs
    const kpis = useMemo(() => {
        const total = cotizaciones.length;
        const vendidas = cotizaciones.filter((c) => c.estado === "VENDIDO").length;
        const pendientes = cotizaciones.filter((c) => c.estado === "PENDIENTE").length;
        const conversion = total > 0 ? Math.round((vendidas / total) * 100) : 0;
        return { total, vendidas, pendientes, conversion };
    }, [cotizaciones]);

    const handleEstadoChange = async (cotizacion: Cotizacion, nuevoEstado: Cotizacion["estado"]) => {
        if (!cotizacion.id || nuevoEstado === cotizacion.estado) return;
        setUpdatingId(cotizacion.id);
        const result = await updateCotizacion(cotizacion.id, { estado: nuevoEstado });
        if (result.success) {
            setCotizaciones((prev) =>
                prev.map((c) => (c.id === cotizacion.id ? { ...c, estado: nuevoEstado } : c))
            );
        }
        setUpdatingId(null);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteCotizacion(id);
        if (result.success) {
            setCotizaciones((prev) => prev.filter((c) => c.id !== id));
        }
        setDeletingId(null);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: es });
        } catch {
            return "—";
        }
    };

    return (
        <OnboardingGuard>
            <div className="min-h-screen bg-zinc-50/50">
                <Header />
                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">

                    {/* Back button */}
                    <div>
                        <Link href="/">
                            <Button variant="outline" className="gap-2 bg-white hover:bg-zinc-100 text-zinc-600">
                                <ArrowLeft className="h-4 w-4" />
                                Volver al Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Card className="border-zinc-200 bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Total Cotizadas
                                        </p>
                                        <p className="mt-1 text-3xl font-bold text-zinc-900">{kpis.total}</p>
                                    </div>
                                    <div className="rounded-xl bg-blue-50 p-2.5">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Vendidas
                                        </p>
                                        <p className="mt-1 text-3xl font-bold text-emerald-600">{kpis.vendidas}</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 p-2.5">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Pendientes
                                        </p>
                                        <p className="mt-1 text-3xl font-bold text-amber-600">{kpis.pendientes}</p>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 p-2.5">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                            Conversión
                                        </p>
                                        <p className="mt-1 text-3xl font-bold text-blue-600">{kpis.conversion}%</p>
                                    </div>
                                    <div className="rounded-xl bg-blue-50 p-2.5">
                                        <TrendingUp className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                        style={{ width: `${kpis.conversion}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Card */}
                    <Card className="border-zinc-200">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <CardTitle className="text-base font-semibold text-zinc-900">
                                        Registro de Cotizaciones
                                    </CardTitle>
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {filtered.length} de {cotizaciones.length}
                                    </Badge>
                                </div>
                                <Button
                                    onClick={() => setShowModal(true)}
                                    className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nueva Cotización
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        placeholder="Buscar por cliente, ramo o compañía..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select value={filterEstado} onValueChange={setFilterEstado}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos</SelectItem>
                                        <SelectItem value="VENDIDO">Vendido</SelectItem>
                                        <SelectItem value="NO_VENDIDO">No Vendido</SelectItem>
                                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent className="px-0 pb-0">
                            {loading ? (
                                <div className="flex items-center justify-center gap-3 py-12 text-zinc-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Cargando cotizaciones...</span>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="mb-3 h-10 w-10 text-zinc-300" />
                                    <p className="text-sm font-medium text-zinc-600">Sin cotizaciones</p>
                                    <p className="text-xs text-zinc-400">
                                        {cotizaciones.length === 0
                                            ? "Registrá tu primera cotización tocando el botón de arriba."
                                            : "No se encontraron resultados con los filtros actuales."}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table className="w-full min-w-[800px]">
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Estado</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fecha</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cliente</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ramo</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Compañías Cotizadas</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Observaciones</TableHead>
                                                <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map((cot) => {
                                                const config = ESTADO_CONFIG[cot.estado] || ESTADO_CONFIG.PENDIENTE;
                                                const isUpdating = updatingId === cot.id;
                                                const isDeleting = deletingId === cot.id;

                                                return (
                                                    <TableRow key={cot.id} className="group transition-colors hover:bg-zinc-50/50">
                                                        {/* Estado Dropdown */}
                                                        <TableCell className="pl-6">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild disabled={isUpdating}>
                                                                    <button className="inline-flex items-center gap-1 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50">
                                                                        {isUpdating ? (
                                                                            <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                                                                        ) : (
                                                                            <>
                                                                                <Badge variant="outline" className={`inline-flex items-center gap-1 text-[11px] font-medium ${config.className}`}>
                                                                                    {config.icon}
                                                                                    {config.label}
                                                                                </Badge>
                                                                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start">
                                                                    <DropdownMenuItem onClick={() => handleEstadoChange(cot, "VENDIDO")} className="gap-2">
                                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Vendido
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEstadoChange(cot, "NO_VENDIDO")} className="gap-2">
                                                                        <XCircle className="h-3.5 w-3.5 text-red-500" /> No Vendido
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEstadoChange(cot, "PENDIENTE")} className="gap-2">
                                                                        <Clock className="h-3.5 w-3.5 text-amber-500" /> Pendiente
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>

                                                        <TableCell className="text-sm text-zinc-500">{formatDate(cot.created_at)}</TableCell>
                                                        <TableCell>
                                                            <p className="text-sm font-medium text-zinc-900">{cot.nombre_cliente}</p>
                                                            {cot.telefono_cliente && (
                                                                <p className="text-xs text-zinc-400">{cot.telefono_cliente}</p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="text-xs">{cot.ramo}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-zinc-600 max-w-[200px]">
                                                            <span className="line-clamp-2">{cot.companias_cotizadas}</span>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-zinc-500 max-w-[180px]">
                                                            <span className="line-clamp-2">{cot.observacion || "—"}</span>
                                                        </TableCell>
                                                        <TableCell className="pr-6 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isDeleting}
                                                                onClick={() => cot.id && handleDelete(cot.id)}
                                                                className="gap-1.5 text-zinc-400 hover:text-red-600"
                                                            >
                                                                {isDeleting ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                )}
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
                </main>

                <NuevaCotizacionModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onCreated={(cot) => setCotizaciones((prev) => [cot, ...prev])}
                />

                <AiChatWidget />
            </div>
        </OnboardingGuard>
    );
}

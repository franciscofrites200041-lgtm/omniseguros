"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { AiChatWidget } from "@/components/AiChatWidget";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { NuevoSiniestroModal } from "@/components/NuevoSiniestroModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft, Plus, Search, ShieldAlert, CheckCircle2, Clock,
    ChevronDown, Loader2, Trash2,
} from "lucide-react";
import Link from "next/link";
import { Siniestro } from "@/lib/types";
import { fetchSiniestros, updateSiniestro, deleteSiniestro } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SiniestrosPage() {
    const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filterResuelto, setFilterResuelto] = useState("TODOS");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSiniestros().then((data) => {
            setSiniestros(data);
            setLoading(false);
        });
    }, []);

    const filtered = useMemo(() => {
        return siniestros.filter((s) => {
            const matchSearch =
                !search ||
                s.nombre_cliente.toLowerCase().includes(search.toLowerCase()) ||
                s.ramo.toLowerCase().includes(search.toLowerCase()) ||
                s.compania.toLowerCase().includes(search.toLowerCase());
            const matchResuelto =
                filterResuelto === "TODOS" ||
                (filterResuelto === "RESUELTO" && s.resuelto) ||
                (filterResuelto === "PENDIENTE" && !s.resuelto);
            return matchSearch && matchResuelto;
        });
    }, [siniestros, search, filterResuelto]);

    // KPIs
    const kpis = useMemo(() => {
        const total = siniestros.length;
        const resueltos = siniestros.filter((s) => s.resuelto).length;
        const pendientes = total - resueltos;
        const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0;
        return { total, resueltos, pendientes, tasaResolucion };
    }, [siniestros]);

    const handleToggleResuelto = async (siniestro: Siniestro) => {
        if (!siniestro.id) return;
        setUpdatingId(siniestro.id);
        const nuevoEstado = !siniestro.resuelto;
        const result = await updateSiniestro(siniestro.id, { resuelto: nuevoEstado });
        if (result.success) {
            setSiniestros((prev) =>
                prev.map((s) => (s.id === siniestro.id ? { ...s, resuelto: nuevoEstado } : s))
            );
        }
        setUpdatingId(null);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteSiniestro(id);
        if (result.success) {
            setSiniestros((prev) => prev.filter((s) => s.id !== id));
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
                            <Button variant="outline" className="gap-2 bg-gradient-to-br from-white to-[#59CBE8]/15 border-[#59CBE8]/30 hover:bg-[#59CBE8]/10 text-zinc-700">
                                <ArrowLeft className="h-4 w-4 text-[#59CBE8]" />
                                Volver al Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Card className="border-[#59CBE8]/30 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Siniestros</p>
                                        <p className="mt-1 text-3xl font-bold text-zinc-900">{kpis.total}</p>
                                    </div>
                                    <div className="rounded-full bg-[#59CBE8]/10 p-2.5">
                                        <ShieldAlert className="h-5 w-5 text-[#59CBE8]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#59CBE8]/30 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Resueltos</p>
                                        <p className="mt-1 text-3xl font-bold text-emerald-600">{kpis.resueltos}</p>
                                    </div>
                                    <div className="rounded-full bg-emerald-50 p-2.5">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#59CBE8]/30 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Pendientes</p>
                                        <p className="mt-1 text-3xl font-bold text-amber-600">{kpis.pendientes}</p>
                                    </div>
                                    <div className="rounded-full bg-amber-50 p-2.5">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#59CBE8]/30 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Tasa de Resolución</p>
                                        <p className="mt-1 text-3xl font-bold text-[#59CBE8]">{kpis.tasaResolucion}%</p>
                                    </div>
                                    <div className="rounded-full bg-[#59CBE8]/10 p-2.5">
                                        <ShieldAlert className="h-5 w-5 text-[#59CBE8]" />
                                    </div>
                                </div>
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                                    <div
                                        className="h-full rounded-full bg-[#59CBE8] transition-all duration-700"
                                        style={{ width: `${kpis.tasaResolucion}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Card */}
                    <Card className="border-[#59CBE8]/30 bg-white/50 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-[#59CBE8]/10 p-1.5">
                                        <ShieldAlert className="h-4 w-4 text-[#59CBE8]" />
                                    </div>
                                    <CardTitle className="text-base font-semibold text-zinc-900">
                                        Registro de Siniestros
                                    </CardTitle>
                                    <Badge variant="outline" className="ml-1 text-[10px] font-bold border-[#59CBE8]/30 bg-[#59CBE8]/5 text-[#59CBE8] uppercase tracking-wider">
                                        {filtered.length} de {siniestros.length}
                                    </Badge>
                                </div>
                                <Button
                                    onClick={() => setShowModal(true)}
                                    className="w-full sm:w-auto gap-2 bg-gradient-to-br from-[#59CBE8] to-[#4ABBD7] text-white hover:opacity-90 shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Cargar Siniestro
                                </Button>
                            </div>

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
                                <Select value={filterResuelto} onValueChange={setFilterResuelto}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODOS">Todos</SelectItem>
                                        <SelectItem value="RESUELTO">Resuelto</SelectItem>
                                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent className="px-0 pb-0">
                            {loading ? (
                                <div className="flex items-center justify-center gap-3 py-12 text-zinc-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Cargando siniestros...</span>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <ShieldAlert className="mb-3 h-10 w-10 text-zinc-300" />
                                    <p className="text-sm font-medium text-zinc-600">Sin siniestros</p>
                                    <p className="text-xs text-zinc-400">
                                        {siniestros.length === 0
                                            ? "Registrá el primer siniestro tocando el botón de arriba."
                                            : "No se encontraron resultados con los filtros actuales."}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table className="w-full min-w-[900px]">
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Estado</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fecha Carga</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cliente</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ramo</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Compañía</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fecha Resolución</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nota</TableHead>
                                                <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map((sin) => {
                                                const isUpdating = updatingId === sin.id;
                                                const isDeleting = deletingId === sin.id;

                                                return (
                                                    <TableRow key={sin.id} className="group transition-colors hover:bg-[#59CBE8]/5">
                                                        {/* Estado toggle */}
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
                                                                                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${sin.resuelto
                                                                                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                                                                                        : "bg-amber-500/15 text-amber-700 border-amber-500/25"
                                                                                        }`}
                                                                                >
                                                                                    {sin.resuelto
                                                                                        ? <CheckCircle2 className="h-3 w-3" />
                                                                                        : <Clock className="h-3 w-3" />}
                                                                                    {sin.resuelto ? "Resuelto" : "Pendiente"}
                                                                                </Badge>
                                                                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start">
                                                                    <DropdownMenuItem onClick={() => handleToggleResuelto(sin)} className="gap-2">
                                                                        {sin.resuelto
                                                                            ? <><Clock className="h-3.5 w-3.5 text-amber-500" /> Marcar como Pendiente</>
                                                                            : <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Marcar como Resuelto</>}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>

                                                        <TableCell className="text-sm text-zinc-500">{formatDate(sin.created_at)}</TableCell>
                                                        <TableCell>
                                                            <p className="text-sm font-medium text-zinc-900">{sin.nombre_cliente}</p>
                                                            {sin.telefono_cliente && (
                                                                <p className="text-xs text-zinc-400">{sin.telefono_cliente}</p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="text-xs">{sin.ramo}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-zinc-600">{sin.compania}</TableCell>
                                                        <TableCell className="text-sm text-zinc-500">{formatDate(sin.fecha_resolucion)}</TableCell>
                                                        <TableCell className="text-sm text-zinc-500 max-w-[200px]">
                                                            <span className="line-clamp-2">{sin.nota || "—"}</span>
                                                        </TableCell>
                                                        <TableCell className="pr-6 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={isDeleting}
                                                                onClick={() => sin.id && handleDelete(sin.id)}
                                                                className="gap-1.5 text-zinc-400 hover:text-red-600"
                                                            >
                                                                {isDeleting
                                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    : <Trash2 className="h-3.5 w-3.5" />}
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

                <NuevoSiniestroModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onCreated={(s) => setSiniestros((prev) => [s, ...prev])}
                />

                <AiChatWidget />
            </div>
        </OnboardingGuard>
    );
}

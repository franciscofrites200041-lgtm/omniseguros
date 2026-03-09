"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyChart } from "@/components/CompanyChart";
import { TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPolizas } from "@/lib/api";
import { calculateKpis, groupByCompany, formatCurrency } from "@/lib/utils";
import { KpiData } from "@/lib/types";

interface MetricsModalProps {
    children: React.ReactNode;
}

export function MetricsModal({ children }: MetricsModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<KpiData | null>(null);
    const [companyData, setCompanyData] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        if (open && !kpis) {
            setLoading(true);
            fetchPolizas()
                .then((polizas) => {
                    setKpis(calculateKpis(polizas));
                    setCompanyData(groupByCompany(polizas));
                })
                .catch((err) => console.error("Error fetching data for metrics", err))
                .finally(() => setLoading(false));
        }
    }, [open, kpis]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-[700px] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-zinc-900">
                        Métricas Generales
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {/* Chart */}
                    <div className="min-h-[350px]">
                        {loading ? (
                            <div className="flex h-[350px] items-center justify-center rounded-xl border border-zinc-200">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                            </div>
                        ) : (
                            <CompanyChart data={companyData} loading={false} />
                        )}
                    </div>

                    {/* KPIs */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {/* Proyectado a Cobrar */}
                        <Card className="relative overflow-hidden border-zinc-200 border-l-4 border-l-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-zinc-500">
                                            Proyectado a Cobrar
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 break-words">
                                            {loading || !kpis ? (
                                                <span className="inline-block h-8 w-32 animate-pulse rounded bg-zinc-200" />
                                            ) : (
                                                formatCurrency(kpis.montoProyectado)
                                            )}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-zinc-400">
                                            Monto mensual vigente
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monto en Riesgo */}
                        <Card className="relative overflow-hidden border-zinc-200 border-l-4 border-l-red-500">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-zinc-500">
                                            Monto en Riesgo
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 break-words">
                                            {loading || !kpis ? (
                                                <span className="inline-block h-8 w-32 animate-pulse rounded bg-zinc-200" />
                                            ) : (
                                                formatCurrency(kpis.montoEnRiesgo)
                                            )}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-zinc-400">
                                            Pólizas impagas
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

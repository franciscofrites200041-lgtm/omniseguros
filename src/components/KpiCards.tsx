"use client";

import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { KpiData } from "@/lib/types";

interface KpiCardsProps {
    data: KpiData;
    loading?: boolean;
}

function KpiSkeleton() {
    return (
        <Card className="relative overflow-hidden border-zinc-200">
            <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 w-24 rounded bg-zinc-200" />
                    <div className="h-8 w-32 rounded bg-zinc-200" />
                    <div className="h-3 w-20 rounded bg-zinc-200" />
                </div>
            </CardContent>
        </Card>
    );
}

export function KpiCards({ data, loading }: KpiCardsProps) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Espacio vacío reservado para futuro KPI */}
                <div className="hidden lg:block" />

                <div className="flex justify-center">
                    <KpiSkeleton />
                </div>

                {/* Espacio vacío reservado para futuro KPI */}
                <div className="hidden lg:block" />
            </div>
        );
    }

    const kpi = {
        title: "Pólizas Vigentes",
        value: data.totalVigentes.toString(),
        subtitle: "Activas actualmente",
        icon: Shield,
        accentColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-l-blue-500",
    };

    return (
        <Card
            className="w-full h-full relative overflow-hidden shadow-lg border-0 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#59CBE8]/10 group bg-linear-to-br from-slate-900 via-zinc-900 to-black"
        >
            {/* Background Effects matching Inncome */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#59CBE8] rounded-full mix-blend-screen filter blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center relative z-10">
                <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold tracking-tight text-white/90 uppercase letter-spacing-widest">
                        {kpi.title}
                    </p>
                    <p className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-[#59CBE8] to-white drop-shadow-sm">
                        {kpi.value}
                    </p>
                    <div className="mt-1 h-1 w-6 mx-auto rounded-full bg-linear-to-r from-[#59CBE8] to-indigo-500/50 opacity-80"></div>
                    <p className="text-[11px] font-medium text-zinc-400 mt-1">{kpi.subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
}

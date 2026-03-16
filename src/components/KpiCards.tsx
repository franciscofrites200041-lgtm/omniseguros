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
            className={`w-full h-full relative overflow-hidden border-zinc-200 border-l-4 ${kpi.borderColor} transition-shadow hover:shadow-md`}
        >
            <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-500">
                            {kpi.title}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 break-words">
                            {kpi.value}
                        </p>
                        <p className="text-xs text-zinc-400">{kpi.subtitle}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

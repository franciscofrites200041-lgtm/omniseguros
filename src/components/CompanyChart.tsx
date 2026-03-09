"use client";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface CompanyChartProps {
    data: { name: string; value: number }[];
    loading?: boolean;
}

const COLORS = [
    "#2563eb", // blue-600
    "#0891b2", // cyan-600
    "#059669", // emerald-600
    "#7c3aed", // violet-600
    "#db2777", // pink-600
    "#d97706", // amber-600
    "#4f46e5", // indigo-600
    "#0d9488", // teal-600
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: { name: string; value: number };
    }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0];
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg">
            <p className="text-sm font-semibold text-zinc-900">{data.name}</p>
            <p className="text-sm text-zinc-500">
                {data.value} {data.value === 1 ? "póliza" : "pólizas"}
            </p>
        </div>
    );
}

interface CustomLegendProps {
    payload?: Array<{
        value: string;
        color: string;
        payload: { value: number };
    }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
    if (!payload) return null;

    return (
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {payload.map((entry, index) => (
                <li key={index} className="flex items-center gap-1.5">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-zinc-600">
                        {entry.value}{" "}
                        <span className="font-semibold text-zinc-800">
                            ({entry.payload?.value})
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function CompanyChart({ data, loading }: CompanyChartProps) {
    return (
        <Card className="border-zinc-200">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base font-semibold text-zinc-900">
                        Distribución por Compañía
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-[280px] items-center justify-center">
                        <div className="h-40 w-40 animate-pulse rounded-full bg-zinc-100" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center text-sm text-zinc-400">
                        Sin datos disponibles
                    </div>
                ) : (
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={0}
                                    animationDuration={800}
                                >
                                    {data.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            className="transition-opacity hover:opacity-80"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={<CustomLegend />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

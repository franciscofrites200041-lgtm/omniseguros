"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PolizasTable } from "@/components/PolizasTable";
import { AiChatWidget } from "@/components/AiChatWidget";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Poliza } from "@/lib/types";
import { fetchPolizas } from "@/lib/api";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function PolizasPage() {
    const [polizas, setPolizas] = useState<Poliza[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchPolizas();
                setPolizas(data);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <OnboardingGuard>
            <div className="min-h-screen bg-zinc-50/50">
                <Header />
                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
                    <div>
                        <Link href="/">
                            <Button variant="outline" className="gap-2 bg-white hover:bg-zinc-100 text-zinc-600">
                                <ArrowLeft className="h-4 w-4" />
                                Volver al Dashboard
                            </Button>
                        </Link>
                    </div>
                    <PolizasTable
                        polizas={polizas}
                        onPolizasChange={setPolizas}
                        loading={loading}
                    />
                </main>
                <AiChatWidget />
            </div>
        </OnboardingGuard>
    );
}

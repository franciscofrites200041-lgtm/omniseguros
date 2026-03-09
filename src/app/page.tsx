"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { KpiCards } from "@/components/KpiCards";
import { AlertsTable } from "@/components/AlertsTable";
import { CotizadorCard } from "@/components/CotizadorCard";
import { AiChatWidget } from "@/components/AiChatWidget";
import { MetricsModal } from "@/components/MetricsModal";
import { NewPolizaModal } from "@/components/NewPolizaModal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClipboardList, BarChart2, Plus, UserCog } from "lucide-react";

import { Poliza, KpiData } from "@/lib/types";
import { fetchPolizas } from "@/lib/api";
import {
  calculateKpis,
  getExpiringPolizas,
} from "@/lib/utils";

export default function DashboardPage() {
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPolizaOpen, setIsNewPolizaOpen] = useState(false);

  const handlePolizaCreated = (newPoliza: Poliza) => {
    setPolizas((prev) => [newPoliza, ...prev]);
  };

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

  const kpis: KpiData = loading
    ? { totalVigentes: 0, montoProyectado: 0, montoEnRiesgo: 0 }
    : calculateKpis(polizas);

  const expiringPolizas = loading ? [] : getExpiringPolizas(polizas, 30);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />

      <main className="grid gap-8 px-8 py-8 lg:grid-cols-3">
        {/* Alerts (Izquierda) */}
        <section className="lg:col-span-1">
          <AlertsTable
            polizas={expiringPolizas}
            allPolizas={polizas}
            loading={loading}
          />
        </section>

        {/* KPI Cards & Navbar (Centro) */}
        <section className="lg:col-span-1">
          <div className="flex flex-col items-center gap-6 h-full">
            <KpiCards data={kpis} loading={loading} />

            {/* Nav Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full flex-grow pb-1">
              <Link href="/polizas" className="w-full h-full">
                <Button variant="outline" className="w-full flex-col h-full py-4 gap-2.5 hover:bg-zinc-100 text-zinc-600 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <ClipboardList className="h-8 w-8 text-zinc-500" />
                  <span className="text-sm font-semibold">Pólizas</span>
                </Button>
              </Link>

              <MetricsModal>
                <Button variant="outline" className="w-full flex-col h-full py-4 gap-2.5 hover:bg-zinc-100 text-zinc-600 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <BarChart2 className="h-8 w-8 text-zinc-500" />
                  <span className="text-sm font-semibold">Métricas</span>
                </Button>
              </MetricsModal>

              <Button
                variant="outline"
                className="w-full flex-col h-full py-4 gap-2.5 hover:bg-zinc-100 text-zinc-600 bg-white shadow-sm transition-shadow hover:shadow-md"
                onClick={() => setIsNewPolizaOpen(true)}
              >
                <Plus className="h-8 w-8 text-zinc-500" />
                <span className="text-sm font-semibold">Nueva Póliza</span>
              </Button>

              <Button variant="outline" className="w-full flex-col h-full py-4 gap-2.5 hover:bg-zinc-100 text-zinc-600 bg-white shadow-sm transition-shadow hover:shadow-md">
                <UserCog className="h-8 w-8 text-zinc-500" />
                <span className="text-sm font-semibold text-center leading-tight">Modificar<br />Cliente</span>
              </Button>
            </div>
          </div>
          <NewPolizaModal
            open={isNewPolizaOpen}
            onClose={() => setIsNewPolizaOpen(false)}
            onCreated={handlePolizaCreated}
          />
        </section>

        {/* Cotizador (Derecha) */}
        <section className="lg:col-span-1">
          <CotizadorCard />
        </section>
      </main>

      {/* Floating AI Chat */}
      <AiChatWidget />
    </div>
  );
}

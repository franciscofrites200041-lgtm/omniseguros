"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Wifi, LayoutDashboard, ClipboardList, BarChart2, Menu, Plus, UserCog, UploadCloud, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricsModal } from "@/components/MetricsModal";
import { NewPolizaModal } from "@/components/NewPolizaModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/utils/supabase/client";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isNewPolizaOpen, setIsNewPolizaOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const today = new Date().toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-8">
                    {/* Left: Logo + Title + Nav */}
                    <div className="flex items-center gap-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 -ml-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Menú</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[340px] px-6">
                                <SheetHeader className="pb-6 border-b border-zinc-100">
                                    <SheetTitle className="text-left font-bold text-xl">Menú Principal</SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-2 mt-6">
                                    <Link href="/">
                                        <Button variant="ghost" className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700">
                                            <LayoutDashboard className="h-5 w-5 text-zinc-500" />
                                            <span className="text-sm font-semibold">Dashboard</span>
                                        </Button>
                                    </Link>

                                    <Link href="/polizas">
                                        <Button variant="ghost" className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700">
                                            <ClipboardList className="h-5 w-5 text-zinc-500" />
                                            <span className="text-sm font-semibold">Pólizas</span>
                                        </Button>
                                    </Link>

                                    <MetricsModal>
                                        <Button variant="ghost" className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700">
                                            <BarChart2 className="h-5 w-5 text-zinc-500" />
                                            <span className="text-sm font-semibold">Métricas</span>
                                        </Button>
                                    </MetricsModal>

                                    <Link href="/importar">
                                        <Button variant="ghost" className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700">
                                            <UploadCloud className="h-5 w-5 text-zinc-500" />
                                            <span className="text-sm font-semibold">Importar Excel</span>
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700"
                                        onClick={() => setIsNewPolizaOpen(true)}
                                    >
                                        <Plus className="h-5 w-5 text-zinc-500" />
                                        <span className="text-sm font-semibold">Nueva Póliza</span>
                                    </Button>

                                    <Button variant="ghost" className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700">
                                        <UserCog className="h-5 w-5 text-zinc-500" />
                                        <span className="text-sm font-semibold">Modificar Cliente</span>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-4 h-12 hover:bg-zinc-100 text-zinc-700"
                                        onClick={() => setIsSettingsOpen(true)}
                                    >
                                        <Settings className="h-5 w-5 text-zinc-500" />
                                        <span className="text-sm font-semibold">Configuración</span>
                                    </Button>

                                    <div className="border-t border-zinc-100 mt-4 pt-4">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-4 h-12 hover:bg-red-50 text-red-600"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span className="text-sm font-semibold">Cerrar Sesión</span>
                                        </Button>
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                                OmniSeguros
                            </h1>
                        </Link>

                    </div>

                    {/* Right: Date + Logout */}
                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm font-medium text-zinc-500 lg:block">
                            {today.charAt(0).toUpperCase() + today.slice(1)}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline text-sm">Salir</span>
                        </Button>
                    </div>
                </div>
            </header>
            <NewPolizaModal
                open={isNewPolizaOpen}
                onClose={() => setIsNewPolizaOpen(false)}
                onCreated={() => { window.location.reload(); }}
            />
            <SettingsModal
                open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}

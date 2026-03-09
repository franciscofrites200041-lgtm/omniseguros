"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Lock, EyeOff, Eye, ArrowRight, ChevronDown, Activity, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulated authentication
        setTimeout(() => {
            if (email.toLowerCase() === "asesor@omniseguros.com" && password === "admin123") {
                router.push("/");
            } else {
                setError("Credenciales incorrectas. (Prueba: asesor@omniseguros.com / admin123)");
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-zinc-200/50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-100">
            {/* Main Application Window (mimicking the reference framing) */}
            <div className="w-full max-w-[1280px] h-[800px] min-h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden border border-zinc-200">

                {/* Left Panel: Immersive Dark Mode (45-50% width) */}
                <div className="hidden lg:flex w-1/2 bg-[#1A1918] text-zinc-100 flex-col relative overflow-hidden">

                    {/* Abstract Network Graph Visualization (simulated in CSS/SVG) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        {/* Concentric subtle circles */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full aspect-square border-t border-b border-zinc-700/30 rounded-full scale-110" />
                        <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 aspect-square border border-zinc-700/20 rounded-full" />

                        {/* Nodes and connecting lines */}
                        <svg className="w-3/4 h-3/4 absolute inset-0 m-auto" viewBox="0 0 200 200">
                            {/* Lines */}
                            <path d="M 50 100 L 100 50 L 150 100 L 100 150 Z" fill="none" stroke="#3b82f6" strokeWidth="0.5" className="opacity-30" />
                            <path d="M 20 80 L 50 100 L 80 160" fill="none" stroke="#94a3b8" strokeWidth="0.5" className="opacity-40" />
                            <path d="M 150 100 L 180 60 L 120 40 Z" fill="none" stroke="#3b82f6" strokeWidth="0.5" className="opacity-20" />
                            <path d="M 100 150 L 140 180" fill="none" stroke="#94a3b8" strokeWidth="0.5" className="opacity-30" />
                            <path d="M 100 50 L 100 150" fill="none" stroke="#94a3b8" strokeWidth="0.2" className="opacity-20" />

                            {/* Nodes */}
                            <circle cx="50" cy="100" r="3" fill="#3b82f6" className="opacity-80" />
                            <circle cx="100" cy="50" r="4" fill="#60a5fa" className="opacity-90" />
                            <circle cx="150" cy="100" r="3" fill="#3b82f6" className="opacity-80" />
                            <circle cx="100" cy="150" r="4" fill="#94a3b8" className="opacity-70" />
                            <circle cx="20" cy="80" r="2" fill="#94a3b8" className="opacity-50" />
                            <circle cx="80" cy="160" r="2.5" fill="#3b82f6" className="opacity-60" />
                            <circle cx="180" cy="60" r="2" fill="#60a5fa" className="opacity-70" />
                            <circle cx="120" cy="40" r="1.5" fill="#94a3b8" className="opacity-50" />
                            <circle cx="140" cy="180" r="2" fill="#3b82f6" className="opacity-60" />
                        </svg>
                    </div>

                    {/* Gradient Overlay to fade bottom/top */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1A1918] via-transparent to-[#1A1918] z-10" />

                    {/* Typography Content */}
                    <div className="relative z-20 flex-grow pt-24 px-16 flex flex-col justify-center text-center">
                        <h1 className="text-4xl text-white font-bold tracking-tight mb-6 leading-tight max-w-[400px] mx-auto">
                            Gestióna tu cartera de seguros
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-[320px] mx-auto leading-relaxed">
                            Un portal integral para asesores, optimizado para la eficiencia analítica y el control operativo.
                        </p>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="absolute bottom-10 inset-x-0 flex justify-center z-20">
                        <div className="w-8 h-8 rounded-full border border-orange-500/50 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-orange-500" />
                        </div>
                    </div>

                </div>

                {/* Right Panel: Utilitarian Light Mode (50-55% width) */}
                <div className="w-full lg:w-1/2 bg-white flex flex-col relative rounded-r-3xl">

                    {/* Top Right Header */}
                    <div className="absolute top-0 left-0 right-0 p-8 sm:p-12 pl-12 sm:pl-16 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-orange-400 border-r-rose-400 rounded-full" />
                            <span className="text-xl font-bold text-zinc-900 tracking-tight">OmniSeguros</span>
                        </div>
                        <button className="flex items-center gap-2 text-[14px] text-zinc-600 hover:text-zinc-900 font-medium transition-colors">
                            <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                            Crear cuenta
                        </button>
                    </div>

                    {/* Center Form Container */}
                    <div className="flex-grow flex flex-col justify-center px-12 sm:px-20 lg:px-24 xl:px-32 max-w-[660px] mx-auto w-full">

                        <h2 className="text-[32px] font-semibold text-zinc-900 mb-10 tracking-tight">
                            Iniciar Sesión
                        </h2>

                        <form className="space-y-6" onSubmit={handleLogin}>

                            {/* Input 1 */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-[18px] h-[18px] text-zinc-400 group-focus-within:text-zinc-600 transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Correo corporativo o ID de agente"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-white border border-zinc-200 rounded-[10px] text-[15px] text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-sm"
                                />
                            </div>

                            {/* Input 2 */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-[18px] h-[18px] text-zinc-400 group-focus-within:text-zinc-600 transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 pl-12 pr-12 bg-white border border-zinc-200 rounded-[10px] text-[15px] text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                    ) : (
                                        <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-[13px] font-medium bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="w-4 h-4" strokeWidth={2} />
                                    {error}
                                </div>
                            )}

                            {/* Forgot Password Link */}
                            <div className="pt-1">
                                <Link href="#" className="text-[13px] text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-[56px] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-[10px] font-medium text-[15px] shadow-[0_8px_16px_rgba(37,99,235,0.25)] transition-all active:scale-[0.99] border border-blue-500/50 disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight className="w-[18px] h-[18px] opacity-0 -ml-4" /> {/* Spacer */}
                                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                    {!isLoading && <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />}
                                </button>
                            </div>

                        </form>

                    </div>

                    {/* Bottom Footer Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 pl-12 sm:pl-16 flex items-center justify-between text-[11px] sm:text-[12px] text-zinc-400 font-medium">
                        <div className="tracking-wide">
                            © 2025-2026 OmniSeguros Inc.
                        </div>
                        <div className="flex items-center gap-6 sm:gap-8">
                            <Link href="#" className="hover:text-zinc-600 transition-colors">
                                Contáctanos
                            </Link>
                            <button className="flex items-center gap-1.5 hover:text-zinc-600 transition-colors">
                                Español <ChevronDown className="w-3 h-3" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

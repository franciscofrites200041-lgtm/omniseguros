import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CotizadorCard() {
    return (
        <Card className="w-full h-full relative overflow-hidden shadow-lg border-0 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#59CBE8]/10 group bg-linear-to-br from-slate-900 via-zinc-900 to-black">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#59CBE8] rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

            <CardContent className="p-4 lg:p-6 flex flex-col justify-between h-full min-h-[360px] lg:min-h-[360px] relative z-10">
                {/* Logo Area */}
                <div className="flex-1 flex flex-col justify-center items-center w-full min-h-[100px] transform group-hover:scale-[1.02] transition-transform duration-500 text-center">
                    <h2 className="text-[2rem] md:text-[2.8rem] leading-none font-black tracking-[-0.04em] text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-50 to-[#59CBE8] drop-shadow-sm">
                        Inncome
                    </h2>
                    <p className="mt-2 text-xs sm:text-[14px] font-medium text-zinc-400 max-w-[200px] leading-relaxed">
                        Haciendo más simple la contratación de seguros.
                    </p>
                    <div className="mt-2 h-1 w-10 rounded-full bg-linear-to-r from-[#59CBE8] to-indigo-500/50 opacity-80"></div>
                </div>

                {/* Actions Area */}
                <div className="w-full max-w-[220px] mx-auto flex flex-col items-center gap-2 mt-auto">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#59CBE8]/80 uppercase mb-1">
                        Cotizar
                    </span>

                    <Link href="/cotizador" className="w-full">
                        <Button className="w-full h-10 bg-white/10 hover:bg-[#59CBE8]/20 backdrop-blur-md border border-white/10 hover:border-[#59CBE8]/50 font-semibold text-white text-sm shadow-xl transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                            <span>Seguros AP</span>
                            <span className="hidden group-hover:inline-block transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-[#59CBE8]">→</span>
                        </Button>
                    </Link>

                    <Button className="w-full h-10 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 font-semibold text-zinc-400 hover:text-white text-sm transition-all duration-300 rounded-xl mt-1">
                        Sepelios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

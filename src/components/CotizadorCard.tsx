import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CotizadorCard() {
    return (
        <Card className="w-full h-full relative overflow-hidden border-zinc-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-8 flex flex-col justify-between h-full min-h-[400px]">
                {/* Logo Area (Text "Inncome" as requested) */}
                <div className="text-center pt-16">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black drop-shadow-sm">
                        Inncome
                    </h2>
                </div>

                {/* Actions Area */}
                <div className="w-full max-w-[220px] mx-auto flex flex-col items-center gap-4 pb-4">
                    <p className="text-sm font-medium tracking-widest text-zinc-500 mb-2 uppercase">
                        Cotizar
                    </p>

                    <Link href="/cotizador" className="w-full">
                        <Button className="w-full h-11 bg-blue-500 hover:bg-blue-600 font-semibold text-white shadow-sm transition-all rounded-xl">
                            Seguros AP
                        </Button>
                    </Link>

                    <span className="text-sm font-medium text-zinc-400">o</span>

                    <Button className="w-full h-11 bg-blue-500 hover:bg-blue-600 font-semibold text-white shadow-sm transition-all rounded-xl">
                        Sepelios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

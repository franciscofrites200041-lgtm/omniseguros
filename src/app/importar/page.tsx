import { Header } from "@/components/Header";
import { AiChatWidget } from "@/components/AiChatWidget";
import { ExcelImporter } from "@/components/ExcelImporter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function ImportarPage() {
    return (
        <OnboardingGuard>
            <div className="min-h-screen bg-zinc-50/50">
                <Header />
                <main className="px-8 py-8 space-y-8 max-w-[1440px] mx-auto">
                    <div>
                        <Link href="/">
                            <Button variant="outline" className="gap-2 bg-gradient-to-br from-white to-[#59CBE8]/15 border-[#59CBE8]/30 hover:bg-[#59CBE8]/10 text-zinc-700">
                                <ArrowLeft className="h-4 w-4 text-[#59CBE8]" />
                                Volver al Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* Excel Importer Component */}
                    <div className="bg-white/50 backdrop-blur-sm border border-[#59CBE8]/30 rounded-2xl p-8 shadow-sm">
                        <ExcelImporter />
                    </div>
                </main>
                <AiChatWidget />
            </div>
        </OnboardingGuard>
    );
}

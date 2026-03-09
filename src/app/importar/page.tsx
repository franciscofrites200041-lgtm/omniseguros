import { Header } from "@/components/Header";
import { AiChatWidget } from "@/components/AiChatWidget";
import { ExcelImporter } from "@/components/ExcelImporter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ImportarPage() {
    return (
        <div className="min-h-screen bg-zinc-50/50">
            <Header />
            <main className="px-8 py-8 space-y-8 max-w-[1440px] mx-auto">
                <div>
                    <Link href="/">
                        <Button variant="outline" className="gap-2 bg-white hover:bg-zinc-100 text-zinc-600">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Excel Importer Component */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                    <ExcelImporter />
                </div>
            </main>
            <AiChatWidget />
        </div>
    );
}

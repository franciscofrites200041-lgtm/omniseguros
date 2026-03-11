"use client";

import { useState, useEffect, FormEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    requireOnboarding?: boolean; // If true, modal cannot be closed until saved
    onSaved?: () => void;
}

export function SettingsModal({ open, onClose, requireOnboarding, onSaved }: SettingsModalProps) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            if (!open) return;
            setLoadingData(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setFullName(user.user_metadata?.full_name || "");
                    setPhone(user.user_metadata?.phone || "");
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoadingData(false);
            }
        }
        loadProfile();
    }, [open, supabase.auth]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitResult(null);

        if (!fullName.trim()) {
            setSubmitResult({ type: "error", msg: "El nombre completo es obligatorio." });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim(),
                    phone: phone.trim()
                }
            });

            if (error) throw error;

            setSubmitResult({ type: "success", msg: "Perfil actualizado correctamente." });

            if (onSaved) {
                onSaved();
            }

            if (!requireOnboarding) {
                setTimeout(() => {
                    handleClose();
                }, 1000);
            }

        } catch (error: any) {
            console.error("Error updating profile:", error);
            setSubmitResult({ type: "error", msg: error.message || "No se pudo actualizar el perfil." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (requireOnboarding) return; // Prevent closing if onboarding
        setSubmitResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="sm:max-w-[425px]"
                onInteractOutside={(e) => {
                    if (requireOnboarding) e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    if (requireOnboarding) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {requireOnboarding ? <User className="h-5 w-5 text-blue-600" /> : <Settings className="h-5 w-5 text-blue-600" />}
                        {requireOnboarding ? "¡Bienvenido a OmniSeguros!" : "Configuración de Perfil"}
                    </DialogTitle>
                    <DialogDescription>
                        {requireOnboarding
                            ? "Para comenzar, por favor ingresá tu nombre completo y número de teléfono de contacto. Estos datos se usarán para personalizar tu experiencia."
                            : "Actualizá tu información personal."}
                    </DialogDescription>
                </DialogHeader>

                {loadingData ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre Completo *</Label>
                            <Input
                                id="fullName"
                                placeholder="Ej: Juan Pérez"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                            <Input
                                id="phone"
                                placeholder="Ej: 5491122334455"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <p className="text-xs text-zinc-500">Opcional. Se utilizará para envíos y notificaciones si es necesario.</p>
                        </div>

                        {submitResult && (
                            <div className={cn(
                                "p-3 rounded-md text-sm font-medium",
                                submitResult.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
                            )}>
                                {submitResult.msg}
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            {!requireOnboarding && (
                                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !fullName.trim() || (submitResult?.type === "success" && !requireOnboarding)}
                                className={cn(submitResult?.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700", requireOnboarding && "w-full sm:w-auto")}
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {requireOnboarding ? "Guardar y Continuar" : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

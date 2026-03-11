"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SettingsModal } from "./SettingsModal";
import { Loader2 } from "lucide-react";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userName, setUserName] = useState("");
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        async function checkProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && mounted) {
                    const fullName = user.user_metadata?.full_name;
                    if (!fullName || fullName.trim() === "") {
                        setNeedsOnboarding(true);
                    } else {
                        // El usuario ya tiene nombre
                        setUserName(fullName);

                        // Solo mostramos el cartel de bienvenida en la primera carga si viene del login
                        // usando sessionStorage para no mostrarlo en cada refresco F5.
                        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
                        if (!hasSeenWelcome) {
                            sessionStorage.setItem('hasSeenWelcome', 'true');

                            // Let the DOM mount with opacity-0 first, then trigger fade-in
                            setTimeout(() => {
                                if (mounted) setShowWelcome(true);
                            }, 100);

                            setTimeout(() => {
                                if (mounted) setShowWelcome(false);
                            }, 3100); // 3 seconds after fade-in starts
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking user profile onboarding:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        checkProfile();

        return () => {
            mounted = false;
        };
    }, [supabase.auth]);

    const handleSaved = async () => {
        // Fetch the updated user profile to get the fresh full_name they just saved
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const fullName = user.user_metadata?.full_name;
                if (fullName) {
                    setUserName(fullName);
                }
            }
        } catch (error) {
            console.error("Error fetching updated user profile:", error);
        }

        // Hide onboarding modal
        setNeedsOnboarding(false);

        // Show welcome banner with a slight delay so the modal has time to fade out nicely
        setTimeout(() => {
            setShowWelcome(true);
            sessionStorage.setItem('hasSeenWelcome', 'true');

            // Auto hide welcome banner after 3 seconds
            setTimeout(() => {
                setShowWelcome(false);
            }, 3000);
        }, 300);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <>
            {children}

            {needsOnboarding && (
                <SettingsModal
                    open={true}
                    onClose={() => { }}
                    requireOnboarding={true}
                    onSaved={handleSaved}
                />
            )}

            {/* Pantalla de Bienvenida */}
            <div
                className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md text-white transition-opacity duration-1000 pointer-events-none ${showWelcome ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Usamos un truco con pointer-events para que mientras sea invisible (opacity 0) no bloquee clics, 
                    y aunque visible tampoco los bloquee demasiado, pero dura solo 3 segundos. */}
                <div className={`transform transition-all duration-1000 ${showWelcome ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center drop-shadow-lg">
                        ¡Bienvenido, {userName.split(' ')[0]}!
                    </h2>
                    <p className="mt-4 text-center text-zinc-200 text-lg font-medium drop-shadow-md">
                        Preparando tu interfaz...
                    </p>
                </div>
            </div>
        </>
    );
}

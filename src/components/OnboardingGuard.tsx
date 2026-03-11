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
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        async function checkProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && mounted) {
                    // Check if the user has a full_name set
                    if (!user.user_metadata?.full_name || user.user_metadata.full_name.trim() === "") {
                        setNeedsOnboarding(true);
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

    const handleSaved = () => {
        setNeedsOnboarding(false);
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
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm pointer-events-auto">
                    {/* The modal itself is rendered here, forced open */}
                    <SettingsModal
                        open={true}
                        onClose={() => { }}
                        requireOnboarding={true}
                        onSaved={handleSaved}
                    />
                </div>
            )}
        </>
    );
}

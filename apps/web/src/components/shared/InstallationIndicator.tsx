"use client";

import {
    Building2,
    Server,
} from "lucide-react";

import { appConfig } from "@/config/app.config";

export function InstallationIndicator() {
    const Icon = appConfig.isCentral
        ? Server
        : Building2;

    return (
        <div
            className="
                flex items-center gap-3
                rounded-lg border
                bg-background px-3 py-2
            "
        >
            <div
                className={`
                    flex h-9 w-9 items-center
                    justify-center rounded-md
                    ${
                        appConfig.isCentral
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                    }
                `}
            >
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
                <p className="text-sm font-semibold text-black">
                    {appConfig.appName}
                </p>

                <p className="text-xs text-muted-foreground">
                    {appConfig.isCentral
                        ? "Central Installation"
                        : `Branch · ${appConfig.branch.code}`}
                </p>
            </div>
        </div>
    );
}
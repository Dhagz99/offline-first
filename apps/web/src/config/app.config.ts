const mode =
    process.env.NEXT_PUBLIC_APP_MODE === "BRANCH"
        ? "BRANCH"
        : "CENTRAL";

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_LAN_URL
        ?.trim()
        .replace(/\/+$/, "") || "";

export const appConfig = {
    mode,

    isCentral: mode === "CENTRAL",

    isBranch: mode === "BRANCH",

    appName:
        process.env.NEXT_PUBLIC_APP_NAME ||
        "Offline First System",

    backendUrl,

    branch: {
        id:
            process.env.NEXT_PUBLIC_BRANCH_ID ||
            null,

        code:
            process.env.NEXT_PUBLIC_BRANCH_CODE ||
            null,
    },

    auth: {
        cookieName:
            process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ||
            "access_token_central",
    },
} as const;
import { env } from "./env";
import { appConfig } from "./app.config";

const isProduction =
    env.NODE_ENV === "production";

const cookieSuffix = appConfig.isCentral
    ? "central"
    : `branch_${appConfig.branch.id}`;

export const authConfig = {

    accessTokenCookie:
        `access_token_${cookieSuffix}`,

    refreshTokenCookie:
        `refresh_token_${cookieSuffix}`,

    accessTokenCookieMaxAge:
        24 * 60 * 60 * 1000,

    refreshTokenCookieMaxAge:
        7 * 24 * 60 * 60 * 1000,

    cookieOptions: {
        httpOnly: true,

        secure: isProduction,

        sameSite: "lax" as const,

        path: "/",
    },

} as const;
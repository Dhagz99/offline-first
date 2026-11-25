import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "@/config/env";
import { appConfig } from "@/config/app.config";
import { jwtConfig } from "@/config/jwt.config";

import type {
    JwtPayload,
} from "@/modules/auth/auth.types";

/* =========================
   TOKEN CONFIGURATION
========================= */

const issuer = appConfig.isCentral
    ? "offline-first-central"
    : `offline-first-branch:${appConfig.branch.id}`;

const audience = "offline-first-web";

const tokenPayloadSchema = z.object({
    id: z.uuid(),

    username: z.string().min(1),

    roles: z.array(z.string()),

    permissions: z.array(z.string()),
});

/* =========================
   GENERATE ACCESS TOKEN
========================= */

export function generateAccessToken(
    payload: JwtPayload
): string {

    return jwt.sign(
        payload,
        env.JWT_SECRET,
        {
            algorithm: "HS256",

            expiresIn:
                jwtConfig.accessTokenExpiresIn,

            issuer,

            audience,
        }
    );
}

/* =========================
   VERIFY ACCESS TOKEN
========================= */

export function verifyToken(
    token: string
): JwtPayload {

    const decoded = jwt.verify(
        token,
        env.JWT_SECRET,
        {
            algorithms: ["HS256"],

            issuer,

            audience,
        }
    );

    return tokenPayloadSchema.parse(decoded);
}

/* =========================
   DECODE TOKEN
   NOT FOR AUTHORIZATION
========================= */

export function decodeToken(
    token: string
): JwtPayload | null {

    const decoded = jwt.decode(token);

    const parsed =
        tokenPayloadSchema.safeParse(decoded);

    return parsed.success
        ? parsed.data
        : null;
}
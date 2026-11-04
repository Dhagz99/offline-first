import type { CorsOptions } from "cors";

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_LAN_URL,
].filter((origin): origin is string => Boolean(origin));

export const corsOptions: CorsOptions = {
    origin(origin, callback) {
        // Allow requests without an Origin header,
        // such as server-to-server requests.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn("CORS rejected origin:", origin);

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};
import axios from "axios";

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_LAN_URL
        ?.trim()
        .replace(/\/+$/, "");

const api = axios.create({
    baseURL: backendUrl
        ? `${backendUrl}/api`
        : "/api",

    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
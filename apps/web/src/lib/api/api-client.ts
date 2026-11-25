import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_LAN_URL;

if (!backendUrl) {
    throw new Error(
        "NEXT_PUBLIC_BACKEND_LAN_URL is not configured"
    );
}

const api = axios.create({
    baseURL: `${backendUrl.replace(/\/+$/, "")}/api`,

    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
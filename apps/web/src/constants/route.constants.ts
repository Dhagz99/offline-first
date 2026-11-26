export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    UNAUTHORIZED: "/unauthorized",

    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        ACCESS_CONTROL: "/admin/access-control",
        BRANCH: "/admin/branch",
        SYNC_VIEW: "/admin/sync-monitoring",
    },

    USER:{
        DASHBOARD: "/user/dashboard",
    }
} as const;
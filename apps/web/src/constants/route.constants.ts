export const ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    UNAUTHORIZED: "/unauthorized",

    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        ACCESS_CONTROL: "/admin/access-control",
        BRANCH: "/admin/branch",
    },

    USER:{
        DASHBOARD: "/user/dashboard",
    }
} as const;
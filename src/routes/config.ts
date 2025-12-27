import { type ComponentType, lazy } from "react";

// ✅ Define all paths here - use these constants everywhere!
export const PATHS = {
    HOME: "/",
    DASHBOARD: "/dashboard",
    USER: "/user",
    TAG: "/tag",
    CATEGORY: "/category",
    POST: "/post",
    COMMENT: "/comment",
    LOGIN: "/login",
    FORBIDDEN: "/forbidden",
    NOT_FOUND: "*",
} as const;

export type PathValue = (typeof PATHS)[keyof typeof PATHS];

export interface RouteConfig {
    path: PathValue | string;
    component: ComponentType;
    children?: RouteConfig[];
}

// Lazy load pages for better performance
const Dashboard = lazy(() => import("../pages/dashboard"));
const User = lazy(() => import("../pages/user"));
const Tag = lazy(() => import("../pages/tag"));
const Category = lazy(() => import("../pages/category"));
const Post = lazy(() => import("../pages/post"));
const Comment = lazy(() => import("../pages/comment"));
const Login = lazy(() => import("../pages/login"));
const Forbidden = lazy(() => import("../pages/forbidden"));
const NotFound = lazy(() => import("../pages/not-found"));

// ✅ Add/remove/update routes here - easy to maintain!
export const routes: RouteConfig[] = [
    { path: PATHS.DASHBOARD, component: Dashboard },
    { path: PATHS.USER, component: User },
    { path: PATHS.TAG, component: Tag },
    { path: PATHS.CATEGORY, component: Category },
    { path: PATHS.POST, component: Post },
    { path: PATHS.COMMENT, component: Comment },
    { path: PATHS.NOT_FOUND, component: NotFound },
];

// Public routes (not protected)
export const publicRoutes: RouteConfig[] = [
    { path: PATHS.LOGIN, component: Login },
    { path: PATHS.FORBIDDEN, component: Forbidden },
];

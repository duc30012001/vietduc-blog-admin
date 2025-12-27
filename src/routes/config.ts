import { type ComponentType, lazy } from "react";

// ✅ Define all paths here - use these constants everywhere!
export const PATHS = {
    HOME: "/",
    USER: "/user",
    TAG: "/tag",
    TAG_FORM: "/tag/form",
    CATEGORY: "/category",
    POST: "/post",
    POST_FORM: "/post/form",
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
const User = lazy(() => import("../pages/user"));
const Tag = lazy(() => import("../pages/tag"));
const TagForm = lazy(() => import("../pages/tag-form"));
const Category = lazy(() => import("../pages/category"));
const Post = lazy(() => import("../pages/post"));
const PostForm = lazy(() => import("../pages/post-form"));
const Comment = lazy(() => import("../pages/comment"));
const Login = lazy(() => import("../pages/login"));
const Forbidden = lazy(() => import("../pages/forbidden"));
const NotFound = lazy(() => import("../pages/not-found"));

// ✅ Add/remove/update routes here - easy to maintain!
export const routes: RouteConfig[] = [
    { path: PATHS.USER, component: User },
    { path: PATHS.TAG, component: Tag },
    { path: PATHS.TAG_FORM, component: TagForm },
    { path: PATHS.CATEGORY, component: Category },
    { path: PATHS.POST, component: Post },
    { path: PATHS.POST_FORM, component: PostForm },
    { path: PATHS.COMMENT, component: Comment },
    { path: PATHS.NOT_FOUND, component: NotFound },
];

// Public routes (not protected)
export const publicRoutes: RouteConfig[] = [
    { path: PATHS.LOGIN, component: Login },
    { path: PATHS.FORBIDDEN, component: Forbidden },
];

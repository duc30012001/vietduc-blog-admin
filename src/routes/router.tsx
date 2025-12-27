import ProtectedRoute from "@/components/protected-route";
import MainLayout from "@/layouts/main-layout";
import { PATHS, publicRoutes, routes, type RouteConfig } from "@/routes/config";
import { Spin } from "antd";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function renderRoutes(routeConfigs: RouteConfig[]) {
    return routeConfigs.map((route) => (
        <Route key={route.path} path={route.path} element={<route.component />}>
            {route.children && renderRoutes(route.children)}
        </Route>
    ));
}

export default function Router() {
    return (
        <BrowserRouter>
            <NuqsAdapter>
                <Suspense
                    fallback={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100vh",
                            }}
                        >
                            <Spin size="large" />
                        </div>
                    }
                >
                    <Routes>
                        {/* Public routes (login, etc.) */}
                        {renderRoutes(publicRoutes)}

                        {/* Protected routes */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Redirect home to /dashboard */}
                            <Route
                                path={PATHS.HOME}
                                element={<Navigate to={PATHS.USER} replace />}
                            />
                            {renderRoutes(routes)}
                        </Route>
                    </Routes>
                </Suspense>
            </NuqsAdapter>
        </BrowserRouter>
    );
}

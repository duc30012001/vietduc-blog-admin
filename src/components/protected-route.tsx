import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { PATHS } from "@/routes/config";
import { Spin } from "antd";
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const { resolvedMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate(PATHS.LOGIN);
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    backgroundColor: resolvedMode === "dark" ? "#141414" : "#f5f5f5",
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}

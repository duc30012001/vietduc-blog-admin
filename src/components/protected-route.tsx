import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useCurrentUser } from "@/modules/users";
import { PATHS } from "@/routes/config";
import { Spin } from "antd";
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const { resolvedMode } = useTheme();
    const navigate = useNavigate();

    // Fetch current user from API to get role
    const { data: currentUser, isLoading: userLoading, isError } = useCurrentUser();

    const isLoading = authLoading || (user && userLoading);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(PATHS.LOGIN);
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        // If API returns error (403 from admin guard) or user is not admin
        if (user && !userLoading && (isError || (currentUser && currentUser.role !== "ADMIN"))) {
            navigate(PATHS.FORBIDDEN);
        }
    }, [user, userLoading, currentUser, isError, navigate]);

    if (isLoading) {
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

    // Wait for role check
    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    return <>{children}</>;
}

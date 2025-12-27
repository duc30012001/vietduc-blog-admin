import { setAuthTokenGetter } from "@/config/axios";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

/**
 * Hook that configures Axios to use Firebase ID token for all requests.
 * Must be called inside AuthProvider context.
 */
export function useAxiosAuth() {
    const { user, getIdToken } = useAuth();

    useEffect(() => {
        if (user) {
            setAuthTokenGetter(async () => {
                const token = await getIdToken();
                return token || "";
            });
        } else {
            setAuthTokenGetter(null);
        }

        return () => {
            setAuthTokenGetter(null);
        };
    }, [getIdToken, user]);
}

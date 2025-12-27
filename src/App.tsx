import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { useAxiosAuth } from "@/hooks/use-axios-auth";
import messages from "@/locales/vi-VN";
import { AntdProvider } from "@/providers";
import Router from "@/routes/router";
import { IntlProvider } from "react-intl";

function AppContent() {
    // Configure Axios to use Firebase Bearer token
    useAxiosAuth();

    return (
        <ThemeProvider>
            <AntdProvider>
                <IntlProvider locale="vi-VN" messages={messages}>
                    <Router />
                </IntlProvider>
            </AntdProvider>
        </ThemeProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;

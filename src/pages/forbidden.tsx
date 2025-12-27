import { useAuth } from "@/contexts/auth-context";
import { Button, Result } from "antd";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const intl = useIntl();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
            }}
        >
            <Result
                status="403"
                title="403"
                subTitle={intl.formatMessage({ id: "page.forbidden.subtitle" })}
                extra={
                    <Button type="primary" onClick={handleLogout}>
                        {intl.formatMessage({ id: "page.forbidden.logout" })}
                    </Button>
                }
            />
        </div>
    );
}

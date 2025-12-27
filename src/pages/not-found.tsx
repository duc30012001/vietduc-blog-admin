import { PATHS } from "@/routes/config";
import { Button, Result } from "antd";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const intl = useIntl();
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                minHeight: 400,
            }}
        >
            <Result
                status="404"
                title={intl.formatMessage({ id: "page.notFound.title" })}
                subTitle={intl.formatMessage({ id: "page.notFound.subtitle" })}
                extra={
                    <Button type="primary" onClick={() => navigate(PATHS.HOME)}>
                        {intl.formatMessage({ id: "page.notFound.backHome" })}
                    </Button>
                }
            />
        </div>
    );
}

import { auth } from "@/config/firebase";
import { useAuth } from "@/contexts/auth-context";
import { PATHS } from "@/routes/config";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, Card, Divider, Form, Input, message, Tabs, Typography } from "antd";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const googleProvider = new GoogleAuthProvider();

interface EmailFormValues {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { user, signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const intl = useIntl();
    const [loading, setLoading] = useState<"email" | "google" | null>(null);
    const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
    const [form] = Form.useForm<EmailFormValues>();

    // If already logged in, redirect to dashboard
    if (user) {
        navigate(PATHS.DASHBOARD);
        return null;
    }

    const handleEmailSubmit = async (values: EmailFormValues) => {
        setLoading("email");
        try {
            if (activeTab === "signin") {
                await signIn(values.email, values.password);
                message.success(intl.formatMessage({ id: "auth.loginSuccess" }));
            } else {
                await signUp(values.email, values.password);
                message.success(intl.formatMessage({ id: "auth.signupSuccess" }));
            }
            navigate(PATHS.DASHBOARD);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Authentication failed";
            message.error(errorMessage);
        } finally {
            setLoading(null);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading("google");
        try {
            await signInWithPopup(auth, googleProvider);
            message.success(intl.formatMessage({ id: "auth.loginSuccess" }));
            navigate(PATHS.DASHBOARD);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Login failed";
            message.error(errorMessage);
        } finally {
            setLoading(null);
        }
    };

    const tabItems = [
        { key: "signin", label: intl.formatMessage({ id: "auth.signIn" }) },
        { key: "signup", label: intl.formatMessage({ id: "auth.signUp" }) },
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: 24,
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: 420,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                    borderRadius: 16,
                }}
                styles={{ body: { padding: 32 } }}
            >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                        }}
                    >
                        <LockOutlinedIcon style={{ fontSize: 32, color: "white" }} />
                    </div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        {intl.formatMessage({ id: "auth.welcome" })}
                    </Title>
                    <Text type="secondary">{intl.formatMessage({ id: "auth.subtitle" })}</Text>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key as "signin" | "signup");
                        form.resetFields();
                    }}
                    items={tabItems}
                    centered
                    style={{ marginBottom: 16 }}
                />

                {/* Google Login */}
                <Button
                    size="large"
                    block
                    loading={loading === "google"}
                    disabled={loading !== null}
                    onClick={handleGoogleLogin}
                    style={{
                        height: 48,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        marginBottom: 16,
                    }}
                    icon={<GoogleIcon style={{ fontSize: 20 }} />}
                >
                    {intl.formatMessage({ id: "auth.continueWithGoogle" })}
                </Button>

                <Divider style={{ margin: "16px 0" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {intl.formatMessage({ id: "auth.orEmail" })}
                    </Text>
                </Divider>

                {/* Email Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEmailSubmit}
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label={intl.formatMessage({ id: "auth.email" })}
                        rules={[
                            {
                                required: true,
                                message: intl.formatMessage({ id: "auth.emailRequired" }),
                            },
                            {
                                type: "email",
                                message: intl.formatMessage({ id: "auth.emailInvalid" }),
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="example@email.com"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={intl.formatMessage({ id: "auth.password" })}
                        rules={[
                            {
                                required: true,
                                message: intl.formatMessage({ id: "auth.passwordRequired" }),
                            },
                            ...(activeTab === "signup"
                                ? [
                                      {
                                          min: 6,
                                          message: intl.formatMessage({
                                              id: "auth.passwordMinLength",
                                          }),
                                      },
                                  ]
                                : []),
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="••••••••"
                            style={{ borderRadius: 8 }}
                            iconRender={(visible) =>
                                visible ? (
                                    <VisibilityIcon style={{ fontSize: 18 }} />
                                ) : (
                                    <VisibilityOffIcon style={{ fontSize: 18 }} />
                                )
                            }
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading === "email"}
                            disabled={loading !== null}
                            size="large"
                            block
                            style={{
                                borderRadius: 8,
                                height: 48,
                                fontWeight: 500,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                border: "none",
                            }}
                        >
                            {activeTab === "signin"
                                ? intl.formatMessage({ id: "auth.signIn" })
                                : intl.formatMessage({ id: "auth.signUp" })}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

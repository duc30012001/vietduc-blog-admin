import { MDEditorWithUpload, UploadImage } from "@/common/components";
import { CACHE_TAGS } from "@/common/constants/cache-tags";
import { revalidateClient } from "@/common/utils/revalidate";
import { uploadThumbnail } from "@/common/utils/storage";
import { siteSettingsApi, type BrandSettingsValue } from "@/modules/site-settings";
import {
    MailOutlined,
    PictureOutlined,
    SaveOutlined,
    TranslationOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Form, Input, message, Row, Space, Tabs } from "antd";
import { useState } from "react";
import { useIntl } from "react-intl";

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;
// Allowed image types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface BrandSettingsTabProps {
    brandValue?: BrandSettingsValue;
    contactEmailValue?: { email: string };
    isLoading: boolean;
}

export const BrandSettingsTab = ({
    brandValue,
    contactEmailValue,
    isLoading,
}: BrandSettingsTabProps) => {
    const intl = useIntl();
    const [brandForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Image states
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Mutation
    const updateBrandMutation = useMutation({
        mutationFn: siteSettingsApi.updateBrandSettings,
        onSuccess: () => {
            message.success(intl.formatMessage({ id: "siteSettings.brand.success" }));
            queryClient.invalidateQueries({ queryKey: ["site-settings"] });
            revalidateClient(CACHE_TAGS.SITE_SETTINGS);
        },
        onError: () => {
            message.error(intl.formatMessage({ id: "siteSettings.brand.error" }));
        },
    });

    const handleSaveBrand = async (values: BrandSettingsValue) => {
        setSubmitting(true);
        try {
            let logoUrl = values.logo;

            if (logoFile) {
                logoUrl = await uploadThumbnail(logoFile);
            }

            updateBrandMutation.mutate({ ...values, logo: logoUrl });
            setLogoFile(null);
        } catch (error) {
            console.error("Failed to upload brand logo:", error);
            message.error(intl.formatMessage({ id: "upload.error" }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card
            title={
                <Space>
                    <PictureOutlined />
                    {intl.formatMessage({ id: "siteSettings.brand.title" })}
                </Space>
            }
            loading={isLoading}
            variant="borderless"
            className="pro-shadow"
            style={{ borderRadius: 16 }}
            extra={
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={updateBrandMutation.isPending || submitting}
                    disabled={submitting}
                    onClick={() => brandForm.submit()}
                >
                    {intl.formatMessage({ id: "action.save.button" })}
                </Button>
            }
        >
            <Form
                form={brandForm}
                layout="vertical"
                onFinish={handleSaveBrand}
                initialValues={
                    brandValue
                        ? { ...brandValue, contactEmail: contactEmailValue?.email }
                        : {
                              logo: "",
                              title: "",
                              contactEmail: "",
                              shortIntroVi: "",
                              shortIntroEn: "",
                              fullIntroVi: "",
                              fullIntroEn: "",
                          }
                }
                key={`${JSON.stringify(brandValue)}-${contactEmailValue?.email}`}
            >
                <Row gutter={[48, 24]}>
                    <Col xs={24} lg={8} xl={6}>
                        <Form.Item
                            name="logo"
                            label={intl.formatMessage({ id: "siteSettings.brand.logo" })}
                        >
                            <UploadImage
                                onFileSelect={(file) => setLogoFile(file)}
                                maxSize={MAX_FILE_SIZE}
                                allowedTypes={ALLOWED_IMAGE_TYPES}
                            />
                        </Form.Item>

                        <Form.Item
                            name="title"
                            label={intl.formatMessage({
                                id: "siteSettings.brand.siteTitle",
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage({
                                        id: "siteSettings.brand.siteTitle.required",
                                    }),
                                },
                            ]}
                        >
                            <Input
                                placeholder={intl.formatMessage({
                                    id: "siteSettings.brand.siteTitle.placeholder",
                                })}
                            />
                        </Form.Item>

                        <Form.Item
                            name="contactEmail"
                            label={intl.formatMessage({
                                id: "siteSettings.contactEmail.label",
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: intl.formatMessage({
                                        id: "siteSettings.contactEmail.required",
                                    }),
                                },
                                {
                                    type: "email",
                                    message: intl.formatMessage({
                                        id: "siteSettings.contactEmail.invalid",
                                    }),
                                },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-muted" />}
                                placeholder={intl.formatMessage({
                                    id: "siteSettings.contactEmail.placeholder",
                                })}
                                style={{ borderRadius: 10 }}
                            />
                        </Form.Item>
                        <Alert
                            title={intl.formatMessage({
                                id: "siteSettings.contactEmail.help",
                            })}
                        />
                    </Col>

                    <Col xs={24} lg={16} xl={18}>
                        <Tabs
                            type="card"
                            items={[
                                {
                                    key: "vi",
                                    forceRender: true,
                                    label: (
                                        <Space>
                                            <TranslationOutlined />
                                            {intl.formatMessage({
                                                id: "post.form.vietnamese",
                                            })}
                                        </Space>
                                    ),
                                    children: (
                                        <div style={{ padding: "20px 0" }}>
                                            <Form.Item
                                                name="shortIntroVi"
                                                label={intl.formatMessage({
                                                    id: "siteSettings.brand.shortIntroVi",
                                                })}
                                            >
                                                <Input
                                                    placeholder={intl.formatMessage({
                                                        id: "siteSettings.brand.shortIntroVi.placeholder",
                                                    })}
                                                    style={{ borderRadius: 10 }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name="fullIntroVi"
                                                label={intl.formatMessage({
                                                    id: "siteSettings.brand.fullIntroVi",
                                                })}
                                            >
                                                <MDEditorWithUpload
                                                    value=""
                                                    onChange={() => {}}
                                                    height={400}
                                                    preview="live"
                                                />
                                            </Form.Item>
                                        </div>
                                    ),
                                },
                                {
                                    key: "en",
                                    forceRender: true,
                                    label: (
                                        <Space>
                                            <TranslationOutlined />
                                            {intl.formatMessage({
                                                id: "post.form.english",
                                            })}
                                        </Space>
                                    ),
                                    children: (
                                        <div style={{ padding: "20px 0" }}>
                                            <Form.Item
                                                name="shortIntroEn"
                                                label={intl.formatMessage({
                                                    id: "siteSettings.brand.shortIntroEn",
                                                })}
                                            >
                                                <Input
                                                    placeholder={intl.formatMessage({
                                                        id: "siteSettings.brand.shortIntroEn.placeholder",
                                                    })}
                                                    style={{ borderRadius: 10 }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name="fullIntroEn"
                                                label={intl.formatMessage({
                                                    id: "siteSettings.brand.fullIntroEn",
                                                })}
                                            >
                                                <MDEditorWithUpload
                                                    value=""
                                                    onChange={() => {}}
                                                    height={400}
                                                    preview="live"
                                                />
                                            </Form.Item>
                                        </div>
                                    ),
                                },
                            ]}
                            style={{
                                background: "#fafafa",
                                padding: "16px 24px",
                                borderRadius: 16,
                            }}
                        />
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

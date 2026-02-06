import { UploadImage } from "@/common/components";
import { uploadThumbnail } from "@/common/utils/storage";
import {
    siteSettingsApi,
    type FooterSocialLinksValue,
    type SocialLink,
} from "@/modules/site-settings";
import {
    DeleteOutlined,
    LinkOutlined,
    PlusOutlined,
    SaveOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, message, Row, Space, Switch } from "antd";
import { useState } from "react";
import { useIntl } from "react-intl";

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;
// Allowed image types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface SocialLinksTabProps {
    socialLinksValue?: FooterSocialLinksValue;
    isLoading: boolean;
}

export const SocialLinksTab = ({ socialLinksValue, isLoading }: SocialLinksTabProps) => {
    const intl = useIntl();
    const [socialLinksForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Image states
    const [socialLogoFiles, setSocialLogoFiles] = useState<Record<number, File>>({});
    const [submitting, setSubmitting] = useState(false);

    // Mutation
    const updateSocialLinksMutation = useMutation({
        mutationFn: siteSettingsApi.updateSocialLinks,
        onSuccess: () => {
            message.success(intl.formatMessage({ id: "siteSettings.socialLinks.success" }));
            queryClient.invalidateQueries({ queryKey: ["site-settings"] });
        },
        onError: () => {
            message.error(intl.formatMessage({ id: "siteSettings.socialLinks.error" }));
        },
    });

    const handleSaveSocialLinks = async (values: { links: SocialLink[] }) => {
        setSubmitting(true);
        try {
            const updatedLinks = [...values.links];

            // Upload all pending social logos
            const uploadPromises = Object.entries(socialLogoFiles).map(async ([index, file]) => {
                const idx = parseInt(index);
                const url = await uploadThumbnail(file);
                updatedLinks[idx] = { ...updatedLinks[idx], logo: url };
            });

            await Promise.all(uploadPromises);

            updateSocialLinksMutation.mutate({ links: updatedLinks });
            setSocialLogoFiles({});
        } catch (error) {
            console.error("Failed to upload social logos:", error);
            message.error(intl.formatMessage({ id: "upload.error" }));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSocialLogoSelect = (file: File | null, index: number) => {
        if (file) {
            setSocialLogoFiles((prev) => ({ ...prev, [index]: file }));
        } else {
            setSocialLogoFiles((prev) => {
                const next = { ...prev };
                delete next[index];
                return next;
            });
        }
    };

    return (
        <Card
            title={
                <Space>
                    <ShareAltOutlined />
                    {intl.formatMessage({ id: "siteSettings.socialLinks.title" })}
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
                    loading={updateSocialLinksMutation.isPending || submitting}
                    disabled={submitting}
                    onClick={() => socialLinksForm.submit()}
                >
                    {intl.formatMessage({ id: "action.save.button" })}
                </Button>
            }
        >
            <Form
                form={socialLinksForm}
                layout="vertical"
                onFinish={handleSaveSocialLinks}
                initialValues={{ links: socialLinksValue?.links || [] }}
                key={JSON.stringify(socialLinksValue)}
            >
                <Form.List name="links">
                    {(fields, { add, remove }) => (
                        <Row gutter={[24, 24]}>
                            {fields.map(({ key, name, ...restField }) => {
                                return (
                                    <Col xs={24} md={12} key={key}>
                                        <Card
                                            size="small"
                                            extra={
                                                <Space>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "enabled"]}
                                                        valuePropName="checked"
                                                        noStyle
                                                    >
                                                        <Switch
                                                            size="small"
                                                            checkedChildren={intl.formatMessage({
                                                                id: "siteSettings.switch.on",
                                                            })}
                                                            unCheckedChildren={intl.formatMessage({
                                                                id: "siteSettings.switch.off",
                                                            })}
                                                        />
                                                    </Form.Item>
                                                    <Button
                                                        danger
                                                        type="text"
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                    />
                                                </Space>
                                            }
                                        >
                                            <Row gutter={16} align="middle">
                                                <Col flex="102px">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "logo"]}
                                                        rules={[{ required: true }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <UploadImage
                                                            onFileSelect={(file) =>
                                                                handleSocialLogoSelect(file, name)
                                                            }
                                                            maxSize={MAX_FILE_SIZE}
                                                            allowedTypes={ALLOWED_IMAGE_TYPES}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col flex="auto">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "name"]}
                                                        rules={[{ required: true }]}
                                                        style={{ marginBottom: 8 }}
                                                    >
                                                        <Input
                                                            placeholder={intl.formatMessage({
                                                                id: "siteSettings.socialLinks.name.placeholder",
                                                            })}
                                                            style={{ borderRadius: 8 }}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, "url"]}
                                                        rules={[{ required: true }]}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <Input
                                                            prefix={
                                                                <LinkOutlined className="text-muted" />
                                                            }
                                                            placeholder={intl.formatMessage({
                                                                id: "siteSettings.socialLinks.url.placeholder",
                                                            })}
                                                            style={{ borderRadius: 8 }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                );
                            })}
                            <Col span={24}>
                                <Button
                                    type="dashed"
                                    onClick={() =>
                                        add({ logo: "", name: "", url: "", enabled: true })
                                    }
                                    block
                                    icon={<PlusOutlined />}
                                >
                                    {intl.formatMessage({
                                        id: "siteSettings.socialLinks.add",
                                    })}
                                </Button>
                            </Col>
                        </Row>
                    )}
                </Form.List>
            </Form>
        </Card>
    );
};

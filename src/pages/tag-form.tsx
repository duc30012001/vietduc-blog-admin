import type { CreateTagDto, UpdateTagDto } from "@/modules/tags";
import { useCreateTag, useTag, useUpdateTag } from "@/modules/tags";
import { PATHS } from "@/routes/config";
import { PageContainer, ProForm, ProFormText } from "@ant-design/pro-components";
import { Button, Card, Form, message, Space, Spin } from "antd";
import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useSearchParams } from "react-router-dom";

interface TagFormValues {
    name_vi: string;
    name_en: string;
}

export default function TagFormPage() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tagId = searchParams.get("id");
    const isViewMode = searchParams.get("mode") === "view";
    const isEdit = !!tagId;

    const [form] = Form.useForm<TagFormValues>();
    const initializedRef = useRef(false);

    // Queries
    const { data: tag, isLoading: isLoadingTag } = useTag(tagId || "");

    // Mutations
    const createMutation = useCreateTag();
    const updateMutation = useUpdateTag();

    // Initialize form when tag data is loaded
    useEffect(() => {
        if (tag && isEdit && !initializedRef.current) {
            initializedRef.current = true;
            form.setFieldsValue({
                name_vi: tag.name_vi,
                name_en: tag.name_en,
            });
        }
    }, [tag, isEdit, form]);

    const handleSubmit = async (values: TagFormValues) => {
        try {
            if (isEdit && tagId) {
                const data: UpdateTagDto = values;
                await updateMutation.mutateAsync({ id: tagId, data });
                message.success(
                    intl.formatMessage(
                        { id: "action.update.success" },
                        { label: intl.formatMessage({ id: "menu.tag" }) }
                    )
                );
            } else {
                const data: CreateTagDto = values;
                await createMutation.mutateAsync(data);
                message.success(
                    intl.formatMessage(
                        { id: "action.create.success" },
                        { label: intl.formatMessage({ id: "menu.tag" }) }
                    )
                );
            }
            navigate(PATHS.TAG);
        } catch {
            message.error(
                intl.formatMessage(
                    { id: isEdit ? "action.update.error" : "action.create.error" },
                    { label: intl.formatMessage({ id: "menu.tag" }) }
                )
            );
        }
    };

    const pageTitle = isViewMode
        ? intl.formatMessage({ id: "tag.form.viewTitle" })
        : isEdit
          ? intl.formatMessage(
                { id: "action.update.title" },
                { label: intl.formatMessage({ id: "menu.tag" }) }
            )
          : intl.formatMessage(
                { id: "action.create.title" },
                { label: intl.formatMessage({ id: "menu.tag" }) }
            );

    if (isEdit && isLoadingTag) {
        return (
            <PageContainer title={pageTitle}>
                <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                    <Spin size="large" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title={pageTitle} onBack={() => navigate(PATHS.TAG)}>
            <Card>
                <ProForm<TagFormValues>
                    form={form}
                    onFinish={handleSubmit}
                    submitter={
                        isViewMode
                            ? false
                            : {
                                  render: (_, dom) => (
                                      <Space style={{ marginTop: 16 }}>
                                          <Button onClick={() => navigate(PATHS.TAG)}>
                                              {intl.formatMessage({ id: "action.cancel.button" })}
                                          </Button>
                                          {dom[1]}
                                      </Space>
                                  ),
                                  searchConfig: {
                                      submitText: intl.formatMessage({ id: "action.save.button" }),
                                  },
                              }
                    }
                    disabled={isViewMode}
                >
                    <ProFormText
                        name="name_vi"
                        label={intl.formatMessage({ id: "tag.form.nameVi" })}
                        placeholder={intl.formatMessage({ id: "tag.form.nameVi.placeholder" })}
                        rules={[
                            {
                                required: true,
                                message: intl.formatMessage(
                                    { id: "validation.required" },
                                    { field: intl.formatMessage({ id: "tag.form.nameVi" }) }
                                ),
                            },
                        ]}
                    />
                    <ProFormText
                        name="name_en"
                        label={intl.formatMessage({ id: "tag.form.nameEn" })}
                        placeholder={intl.formatMessage({ id: "tag.form.nameEn.placeholder" })}
                        rules={[
                            {
                                required: true,
                                message: intl.formatMessage(
                                    { id: "validation.required" },
                                    { field: intl.formatMessage({ id: "tag.form.nameEn" }) }
                                ),
                            },
                        ]}
                    />
                </ProForm>
            </Card>
        </PageContainer>
    );
}

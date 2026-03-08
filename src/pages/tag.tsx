import type { CreateTagDto, Tag, TagQuery, UpdateTagDto } from "@/modules/tags";
import { tagApi, useCreateTag, useDeleteTag, useUpdateTag } from "@/modules/tags";
import {
    PageContainer,
    ProForm,
    ProFormText,
    ProTable,
    type ActionType,
    type ProColumns,
} from "@ant-design/pro-components";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Button, Dropdown, Form, message, Modal, type MenuProps } from "antd";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

interface TagFormValues {
    name_vi: string;
    name_en: string;
}

type ModalMode = "create" | "edit" | "view";

export default function TagPage() {
    const intl = useIntl();
    const actionRef = useRef<ActionType>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("create");
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const [form] = Form.useForm<TagFormValues>();

    const deleteTagMutation = useDeleteTag();
    const createMutation = useCreateTag();
    const updateMutation = useUpdateTag();

    // Reset form when modal opens with tag data
    useEffect(() => {
        if (modalOpen) {
            if (editingTag) {
                form.setFieldsValue({
                    name_vi: editingTag.name_vi,
                    name_en: editingTag.name_en,
                });
            } else {
                form.resetFields();
            }
        }
    }, [modalOpen, editingTag, form]);

    const openModal = (mode: ModalMode, tag?: Tag) => {
        setModalMode(mode);
        setEditingTag(tag || null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingTag(null);
        form.resetFields();
    };

    const handleSubmit = async (values: TagFormValues) => {
        try {
            if (modalMode === "edit" && editingTag) {
                const data: UpdateTagDto = values;
                await updateMutation.mutateAsync({ id: editingTag.id, data });
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
            closeModal();
            actionRef.current?.reload();
        } catch {
            message.error(
                intl.formatMessage(
                    { id: modalMode === "edit" ? "action.update.error" : "action.create.error" },
                    { label: intl.formatMessage({ id: "menu.tag" }) }
                )
            );
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTagMutation.mutateAsync(id);
            message.success(
                intl.formatMessage(
                    { id: "action.delete.success" },
                    { label: intl.formatMessage({ id: "menu.tag" }) }
                )
            );
            actionRef.current?.reload();
        } catch {
            message.error(
                intl.formatMessage(
                    { id: "action.delete.error" },
                    { label: intl.formatMessage({ id: "menu.tag" }) }
                )
            );
        }
    };

    const columns: ProColumns<Tag>[] = [
        {
            title: intl.formatMessage({ id: "tag.table.nameVi" }),
            dataIndex: "name_vi",
            key: "name_vi",
            width: 200,
        },
        {
            title: intl.formatMessage({ id: "tag.table.nameEn" }),
            dataIndex: "name_en",
            key: "name_en",
            width: 200,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "tag.table.slug" }),
            dataIndex: "slug",
            key: "slug",
            width: 200,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "post.table.author" }),
            dataIndex: ["creator", "name"],
            key: "creator",
            width: 150,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "post.table.createdAt" }),
            dataIndex: "created_at",
            key: "created_at",
            valueType: "dateTime",
            width: 180,
            search: false,
            sorter: true,
        },
        {
            title: intl.formatMessage({ id: "action.title" }),
            key: "actions",
            width: 120,
            fixed: "right",
            search: false,
            render: (_, record) => {
                const items: MenuProps["items"] = [
                    {
                        key: "view",
                        label: intl.formatMessage({ id: "action.view.button" }),
                        icon: <VisibilityOutlinedIcon style={{ fontSize: 18 }} />,
                        onClick: () => openModal("view", record),
                    },
                    {
                        key: "edit",
                        label: intl.formatMessage({ id: "action.update.button" }),
                        icon: <EditOutlinedIcon style={{ fontSize: 18 }} />,
                        onClick: () => openModal("edit", record),
                    },
                    {
                        type: "divider",
                    },
                    {
                        key: "delete",
                        label: intl.formatMessage({ id: "action.delete.button" }),
                        icon: <DeleteOutlinedIcon style={{ fontSize: 18 }} />,
                        danger: true,
                        onClick: () => {
                            Modal.confirm({
                                title: intl.formatMessage(
                                    { id: "action.delete.title" },
                                    { label: record.name_vi }
                                ),
                                content: intl.formatMessage(
                                    { id: "action.delete.alert" },
                                    { label: record.name_vi }
                                ),
                                okText: intl.formatMessage({ id: "action.delete.button" }),
                                cancelText: intl.formatMessage({ id: "action.cancel.button" }),
                                onOk: () => handleDelete(record.id),
                            });
                        },
                    },
                ];

                return (
                    <Dropdown menu={{ items }} trigger={["click"]}>
                        <Button type="text" icon={<MoreVertOutlinedIcon fontSize="small" />} />
                    </Dropdown>
                );
            },
        },
    ];

    const modalTitle =
        modalMode === "view"
            ? intl.formatMessage({ id: "tag.form.viewTitle" })
            : modalMode === "edit"
              ? intl.formatMessage(
                    { id: "action.update.title" },
                    { label: intl.formatMessage({ id: "menu.tag" }) }
                )
              : intl.formatMessage(
                    { id: "action.create.title" },
                    { label: intl.formatMessage({ id: "menu.tag" }) }
                );

    const isViewMode = modalMode === "view";
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <PageContainer
            title={intl.formatMessage({ id: "page.tag.title" })}
            extra={[
                <Button
                    key="create"
                    type="primary"
                    icon={<AddIcon />}
                    onClick={() => openModal("create")}
                >
                    {intl.formatMessage({ id: "action.create.button" })}
                </Button>,
            ]}
        >
            <ProTable<Tag, TagQuery>
                actionRef={actionRef}
                columns={columns}
                rowKey="id"
                scroll={{ x: 900 }}
                request={async (params) => {
                    const query: TagQuery = {
                        keyword: (params as Record<string, unknown>).name_vi as string,
                        page: params.current,
                        limit: params.pageSize,
                    };

                    try {
                        const result = await tagApi.getTags(query);
                        return {
                            data: result.data,
                            success: true,
                            total: result.meta.total,
                        };
                    } catch {
                        return {
                            data: [],
                            success: false,
                            total: 0,
                        };
                    }
                }}
                pagination={{
                    defaultPageSize: 20,
                    showSizeChanger: true,
                }}
                search={{
                    labelWidth: "auto",
                }}
                options={{
                    density: true,
                    fullScreen: true,
                    reload: true,
                    setting: true,
                }}
            />

            <Modal
                title={modalTitle}
                open={modalOpen}
                onCancel={closeModal}
                footer={isViewMode ? null : undefined}
                onOk={() => form.submit()}
                okText={intl.formatMessage({ id: "action.save.button" })}
                cancelText={intl.formatMessage({ id: "action.cancel.button" })}
                confirmLoading={isSubmitting}
                destroyOnClose
            >
                <ProForm<TagFormValues>
                    form={form}
                    onFinish={handleSubmit}
                    submitter={false}
                    disabled={isViewMode}
                    style={{ marginTop: 16 }}
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
            </Modal>
        </PageContainer>
    );
}

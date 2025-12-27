import type { Tag, TagQuery } from "@/modules/tags";
import { tagApi, useDeleteTag } from "@/modules/tags";
import { PATHS } from "@/routes/config";
import {
    PageContainer,
    ProTable,
    type ActionType,
    type ProColumns,
} from "@ant-design/pro-components";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Button, message, Popconfirm, Space } from "antd";
import { useRef } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

export default function TagPage() {
    const intl = useIntl();
    const navigate = useNavigate();
    const actionRef = useRef<ActionType>(null);

    const deleteTagMutation = useDeleteTag();

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
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<VisibilityIcon fontSize="small" />}
                        onClick={() => navigate(`${PATHS.TAG_FORM}?id=${record.id}&mode=view`)}
                    />
                    <Button
                        type="text"
                        icon={<EditIcon fontSize="small" />}
                        onClick={() => navigate(`${PATHS.TAG_FORM}?id=${record.id}`)}
                    />
                    <Popconfirm
                        title={intl.formatMessage(
                            { id: "action.delete.alert" },
                            { label: record.name_vi }
                        )}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="text" danger icon={<DeleteIcon fontSize="small" />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer
            title={intl.formatMessage({ id: "page.tag.title" })}
            extra={[
                <Button
                    key="create"
                    type="primary"
                    icon={<AddIcon />}
                    onClick={() => navigate(PATHS.TAG_FORM)}
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
                        keyword: params.keyword,
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
        </PageContainer>
    );
}

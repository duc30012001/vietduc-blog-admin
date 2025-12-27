import { useCategoryTree } from "@/modules/categories";
import type { Post, PostQuery, PostStatus } from "@/modules/posts";
import { useDeletePost } from "@/modules/posts";
import { postApi } from "@/modules/posts/api";
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
import { Avatar, Button, message, Popconfirm, Space, Tag, TreeSelect, Typography } from "antd";
import { useRef } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

export default function PostPage() {
    const intl = useIntl();
    const navigate = useNavigate();
    const actionRef = useRef<ActionType>(null);

    const { data: categories } = useCategoryTree();
    const deletePostMutation = useDeletePost();

    const handleDelete = async (id: string) => {
        try {
            await deletePostMutation.mutateAsync(id);
            message.success(
                intl.formatMessage(
                    { id: "action.delete.success" },
                    { label: intl.formatMessage({ id: "menu.post" }) }
                )
            );
            actionRef.current?.reload();
        } catch {
            message.error(
                intl.formatMessage(
                    { id: "action.delete.error" },
                    { label: intl.formatMessage({ id: "menu.post" }) }
                )
            );
        }
    };

    const statusColorMap: Record<PostStatus, string> = {
        DRAFT: "default",
        PUBLISHED: "success",
        ARCHIVED: "warning",
    };

    const statusLabelMap: Record<PostStatus, string> = {
        DRAFT: intl.formatMessage({ id: "post.status.draft" }),
        PUBLISHED: intl.formatMessage({ id: "post.status.published" }),
        ARCHIVED: intl.formatMessage({ id: "post.status.archived" }),
    };

    const columns: ProColumns<Post>[] = [
        {
            title: intl.formatMessage({ id: "post.table.titleVi" }),
            dataIndex: "title_vi",
            key: "title_vi",
            ellipsis: true,
            width: 250,
            render: (_, record) => (
                <Space>
                    <Avatar size={40} src={record.thumbnail} shape="square">
                        {record.title_vi.charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ display: "flex", flexDirection: "column", maxWidth: 200 }}>
                        <Typography.Text ellipsis={{ tooltip: record.title_vi }}>
                            {record.title_vi}
                        </Typography.Text>
                        <Typography.Text ellipsis={{ tooltip: record.title_en }} type="secondary">
                            {record.title_en}
                        </Typography.Text>
                    </div>
                </Space>
            ),
        },
        {
            title: intl.formatMessage({ id: "post.table.category" }),
            dataIndex: "category_id",
            key: "category_id",
            width: 150,
            render: (_, record) => record.category?.name_vi || "-",
            renderFormItem: () => {
                interface TreeNode {
                    title: string;
                    value: string;
                    children?: TreeNode[];
                }
                const buildTreeData = (cats: typeof categories): TreeNode[] => {
                    if (!cats) return [];
                    return cats.map((cat) => ({
                        title: cat.name_vi,
                        value: cat.id,
                        children: cat.children ? buildTreeData(cat.children) : undefined,
                    }));
                };
                return (
                    <TreeSelect
                        treeData={buildTreeData(categories)}
                        placeholder={intl.formatMessage({ id: "post.form.category.placeholder" })}
                        allowClear
                        showSearch
                        treeNodeFilterProp="title"
                        treeDefaultExpandAll
                    />
                );
            },
        },
        {
            title: intl.formatMessage({ id: "post.table.status" }),
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (_, record) => (
                <Tag color={statusColorMap[record.status]}>{statusLabelMap[record.status]}</Tag>
            ),
            valueType: "select",
            valueEnum: {
                DRAFT: { text: statusLabelMap.DRAFT },
                PUBLISHED: { text: statusLabelMap.PUBLISHED },
                ARCHIVED: { text: statusLabelMap.ARCHIVED },
            },
        },
        {
            title: intl.formatMessage({ id: "post.table.author" }),
            dataIndex: ["creator", "name"],
            key: "author",
            width: 150,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "post.table.publishedAt" }),
            dataIndex: "published_at",
            key: "published_at",
            valueType: "dateTime",
            width: 180,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "post.table.createdAt" }),
            dataIndex: "created_at",
            key: "created_at",
            valueType: "dateTime",
            width: 180,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "action.title" }),
            key: "actions",
            width: 150,
            fixed: "right",
            search: false,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<VisibilityIcon fontSize="small" />}
                        onClick={() => navigate(`${PATHS.POST_FORM}?id=${record.id}&mode=view`)}
                    />
                    <Button
                        type="text"
                        icon={<EditIcon fontSize="small" />}
                        onClick={() => navigate(`${PATHS.POST_FORM}?id=${record.id}`)}
                    />
                    <Popconfirm
                        title={intl.formatMessage(
                            { id: "action.delete.alert" },
                            { label: record.title_vi }
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
            title={intl.formatMessage({ id: "page.post.title" })}
            extra={[
                <Button
                    key="create"
                    type="primary"
                    icon={<AddIcon />}
                    onClick={() => navigate(PATHS.POST_FORM)}
                >
                    {intl.formatMessage({ id: "action.create.button" })}
                </Button>,
            ]}
        >
            <ProTable<Post, PostQuery>
                actionRef={actionRef}
                columns={columns}
                rowKey="id"
                scroll={{ x: 1200 }}
                request={async (params) => {
                    const query: PostQuery = {
                        keyword: params.keyword,
                        page: params.current,
                        limit: params.pageSize,
                        status: params.status as PostStatus,
                        category_id: params.category_id,
                    };

                    try {
                        const result = await postApi.getPosts(query);
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
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) =>
                        intl.formatMessage(
                            { id: "pagination.showTotal" },
                            { range0: range[0], range1: range[1], total }
                        ),
                }}
                search={{
                    labelWidth: "auto",
                }}
                dateFormatter="string"
            />
        </PageContainer>
    );
}

import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";
import { Tag } from "antd";
import { useIntl } from "react-intl";

interface PostRecord {
    id: string;
    titleVi: string;
    titleEn: string;
    authorName: string;
    categoryName: string;
    status: string;
    publishedAt: string;
    createdAt: string;
}

export default function PostPage() {
    const intl = useIntl();

    const columns: ProColumns<PostRecord>[] = [
        {
            title: intl.formatMessage({ id: "post.table.titleVi" }),
            dataIndex: "titleVi",
            key: "titleVi",
        },
        {
            title: intl.formatMessage({ id: "post.table.titleEn" }),
            dataIndex: "titleEn",
            key: "titleEn",
        },
        {
            title: intl.formatMessage({ id: "post.table.author" }),
            dataIndex: "authorName",
            key: "authorName",
        },
        {
            title: intl.formatMessage({ id: "post.table.category" }),
            dataIndex: "categoryName",
            key: "categoryName",
        },
        {
            title: intl.formatMessage({ id: "post.table.status" }),
            dataIndex: "status",
            key: "status",
            render: (_, record) => {
                const colorMap: Record<string, string> = {
                    draft: "default",
                    published: "success",
                    archived: "warning",
                };
                const labelMap: Record<string, string> = {
                    draft: intl.formatMessage({ id: "post.status.draft" }),
                    published: intl.formatMessage({ id: "post.status.published" }),
                    archived: intl.formatMessage({ id: "post.status.archived" }),
                };
                return <Tag color={colorMap[record.status]}>{labelMap[record.status]}</Tag>;
            },
        },
        {
            title: intl.formatMessage({ id: "post.table.publishedAt" }),
            dataIndex: "publishedAt",
            key: "publishedAt",
            valueType: "dateTime",
        },
        {
            title: intl.formatMessage({ id: "post.table.createdAt" }),
            dataIndex: "createdAt",
            key: "createdAt",
            valueType: "dateTime",
        },
    ];

    return (
        <PageContainer title={intl.formatMessage({ id: "page.post.title" })}>
            <ProTable<PostRecord>
                columns={columns}
                dataSource={[]}
                rowKey="id"
                search={false}
                pagination={{
                    pageSize: 10,
                }}
            />
        </PageContainer>
    );
}

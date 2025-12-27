import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";
import { Tag } from "antd";
import { useIntl } from "react-intl";

interface CommentRecord {
    id: string;
    content: string;
    authorName: string;
    postTitle: string;
    parentAuthorName: string;
    status: string;
    createdAt: string;
}

export default function CommentPage() {
    const intl = useIntl();

    const columns: ProColumns<CommentRecord>[] = [
        {
            title: intl.formatMessage({ id: "comment.table.content" }),
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            width: 300,
        },
        {
            title: intl.formatMessage({ id: "comment.table.author" }),
            dataIndex: "authorName",
            key: "authorName",
        },
        {
            title: intl.formatMessage({ id: "comment.table.post" }),
            dataIndex: "postTitle",
            key: "postTitle",
            ellipsis: true,
        },
        {
            title: intl.formatMessage({ id: "comment.table.parent" }),
            dataIndex: "parentAuthorName",
            key: "parentAuthorName",
        },
        {
            title: intl.formatMessage({ id: "comment.table.status" }),
            dataIndex: "status",
            key: "status",
            render: (_, record) => {
                const colorMap: Record<string, string> = {
                    pending: "processing",
                    approved: "success",
                    rejected: "error",
                };
                const labelMap: Record<string, string> = {
                    pending: intl.formatMessage({ id: "comment.status.pending" }),
                    approved: intl.formatMessage({ id: "comment.status.approved" }),
                    rejected: intl.formatMessage({ id: "comment.status.rejected" }),
                };
                return <Tag color={colorMap[record.status]}>{labelMap[record.status]}</Tag>;
            },
        },
        {
            title: intl.formatMessage({ id: "comment.table.createdAt" }),
            dataIndex: "createdAt",
            key: "createdAt",
            valueType: "dateTime",
        },
    ];

    return (
        <PageContainer title={intl.formatMessage({ id: "page.comment.title" })}>
            <ProTable<CommentRecord>
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

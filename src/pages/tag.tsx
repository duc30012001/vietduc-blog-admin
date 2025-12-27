import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useIntl } from "react-intl";

export default function TagPage() {
    const intl = useIntl();

    const columns = [
        {
            title: intl.formatMessage({ id: "tag.table.name" }),
            dataIndex: "name",
            key: "name",
        },
        {
            title: intl.formatMessage({ id: "tag.table.slug" }),
            dataIndex: "slug",
            key: "slug",
        },
        {
            title: intl.formatMessage({ id: "tag.table.postCount" }),
            dataIndex: "postCount",
            key: "postCount",
            valueType: "digit",
        },
        {
            title: intl.formatMessage({ id: "tag.table.createdAt" }),
            dataIndex: "createdAt",
            key: "createdAt",
            valueType: "dateTime",
        },
    ];

    return (
        <PageContainer title={intl.formatMessage({ id: "page.tag.title" })}>
            <ProTable
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

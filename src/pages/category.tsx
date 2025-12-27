import { PageContainer, ProTable } from "@ant-design/pro-components";
import { useIntl } from "react-intl";

export default function CategoryPage() {
    const intl = useIntl();

    const columns = [
        {
            title: intl.formatMessage({ id: "category.table.name" }),
            dataIndex: "name",
            key: "name",
        },
        {
            title: intl.formatMessage({ id: "category.table.slug" }),
            dataIndex: "slug",
            key: "slug",
        },
        {
            title: intl.formatMessage({ id: "category.table.parent" }),
            dataIndex: "parentName",
            key: "parentName",
        },
        {
            title: intl.formatMessage({ id: "category.table.postCount" }),
            dataIndex: "postCount",
            key: "postCount",
            valueType: "digit",
        },
        {
            title: intl.formatMessage({ id: "category.table.createdAt" }),
            dataIndex: "createdAt",
            key: "createdAt",
            valueType: "dateTime",
        },
    ];

    return (
        <PageContainer title={intl.formatMessage({ id: "page.category.title" })}>
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

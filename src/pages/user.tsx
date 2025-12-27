import type { SortOrder } from "@/common/types";
import { useSyncFirebaseUsers, useUpdateUser, useUsers } from "@/modules/users";
import type { User, UserQuery, UserRole } from "@/modules/users/types";
import { SyncOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { Avatar, Button, message, Select } from "antd";
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useIntl } from "react-intl";

// User query parsers for URL state
const userQueryParsers = {
    keyword: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
    sort_order: parseAsString.withDefault("desc"),
    sort_by: parseAsString.withDefault("created_at"),
    role: parseAsString,
    is_verified: parseAsBoolean,
};

export default function UserPage() {
    const intl = useIntl();
    const [queryState, setQuery] = useQueryStates(userQueryParsers, { history: "push" });

    // Transform null to undefined for UserQuery compatibility
    const query: UserQuery = {
        keyword: queryState.keyword ?? undefined,
        page: queryState.page,
        limit: queryState.limit,
        sort_order: (queryState.sort_order as SortOrder) ?? undefined,
        sort_by: queryState.sort_by ?? undefined,
        role: queryState.role as UserQuery["role"],
        is_verified: queryState.is_verified ?? undefined,
    };

    const { data: usersResponse, isLoading, refetch } = useUsers(query);
    const syncFirebase = useSyncFirebaseUsers();
    const updateUser = useUpdateUser();

    const handleSync = async () => {
        try {
            const result = await syncFirebase.mutateAsync();
            message.success(
                intl.formatMessage(
                    { id: "user.sync.success" },
                    { synced: result.synced, total: result.total }
                )
            );
            if (result.errors.length > 0) {
                console.warn("Sync errors:", result.errors);
            }
        } catch {
            message.error(intl.formatMessage({ id: "user.sync.error" }));
        }
    };

    const handleRoleChange = async (userId: string, role: UserRole) => {
        try {
            await updateUser.mutateAsync({ id: userId, data: { role } });
            message.success(intl.formatMessage({ id: "user.update.success" }));
        } catch {
            message.error(intl.formatMessage({ id: "user.update.error" }));
        }
    };

    const columns: ProColumns<User>[] = [
        {
            title: intl.formatMessage({ id: "user.table.avatar" }),
            dataIndex: "avatar",
            key: "avatar",
            width: 60,
            search: false,
            render: (_, record) => (
                <Avatar src={record.avatar} size="small">
                    {record.name?.charAt(0).toUpperCase()}
                </Avatar>
            ),
        },
        {
            title: intl.formatMessage({ id: "user.table.name" }),
            dataIndex: "name",
            key: "name",
            width: 200,
            ellipsis: true,
            sorter: true,
        },
        {
            title: intl.formatMessage({ id: "user.table.email" }),
            dataIndex: "email",
            key: "email",
            ellipsis: true,
            copyable: true,
            search: false,
            width: 250,
            sorter: true,
        },
        {
            title: intl.formatMessage({ id: "user.table.role" }),
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (_, record) => (
                <Select
                    value={record.role}
                    onChange={(value) => handleRoleChange(record.id, value)}
                    loading={updateUser.isPending}
                    size="small"
                    style={{ width: 100 }}
                    options={[
                        { value: "ADMIN", label: "Admin" },
                        { value: "USER", label: "User" },
                    ]}
                />
            ),
            valueEnum: {
                ADMIN: { text: "Admin", status: "Error" },
                USER: { text: "User", status: "Processing" },
            },
        },
        {
            title: intl.formatMessage({ id: "user.table.verified" }),
            dataIndex: "is_verified",
            key: "is_verified",
            width: 100,
            // render: (_, record) => (
            //     <Tag color={record.is_verified ? "green" : "default"}>
            //         {record.is_verified
            //             ? intl.formatMessage({ id: "common.yes" })
            //             : intl.formatMessage({ id: "common.no" })}
            //     </Tag>
            // ),
            valueEnum: {
                true: { text: intl.formatMessage({ id: "common.yes" }), status: "Success" },
                false: { text: intl.formatMessage({ id: "common.no" }), status: "Default" },
            },
        },
        {
            title: intl.formatMessage({ id: "user.table.createdAt" }),
            dataIndex: "created_at",
            key: "created_at",
            valueType: "dateTime",
            width: 180,
            sorter: true,
            search: false,
        },
        {
            title: intl.formatMessage({ id: "user.table.updatedAt" }),
            dataIndex: "updated_at",
            key: "updated_at",
            valueType: "dateTime",
            width: 180,
            sorter: true,
            search: false,
        },
    ];

    return (
        <PageContainer
            title={intl.formatMessage({ id: "page.user.title" })}
            extra={
                <Button
                    icon={<SyncOutlined spin={syncFirebase.isPending} />}
                    onClick={handleSync}
                    loading={syncFirebase.isPending}
                >
                    {intl.formatMessage({ id: "user.sync.button" })}
                </Button>
            }
        >
            <ProTable<User>
                columns={columns}
                dataSource={usersResponse?.data || []}
                rowKey="id"
                loading={isLoading}
                search={{
                    labelWidth: "auto",
                }}
                form={{
                    colon: false,
                    initialValues: {
                        name: query.keyword,
                        role: query.role,
                        is_verified:
                            query.is_verified !== undefined ? String(query.is_verified) : undefined,
                    },
                }}
                options={{
                    density: true,
                    fullScreen: true,
                    reload: () => refetch(),
                }}
                pagination={{
                    current: usersResponse?.meta.page || queryState.page,
                    pageSize: usersResponse?.meta.limit || queryState.limit,
                    total: usersResponse?.meta.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        intl.formatMessage(
                            { id: "pagination.showTotal" },
                            { range0: range[0], range1: range[1], total }
                        ),
                    onChange: (page, pageSize) => {
                        setQuery({ page, limit: pageSize });
                    },
                }}
                onChange={(_, _filters, sorter) => {
                    if (!Array.isArray(sorter) && sorter.field) {
                        setQuery({
                            sort_by: sorter.field as string,
                            sort_order: sorter.order === "ascend" ? "asc" : "desc",
                        });
                    }
                }}
                onSubmit={(values) => {
                    setQuery({
                        keyword: values.name || values.email || undefined,
                        role: values.role || undefined,
                        is_verified: values.is_verified ?? undefined,
                        page: 1,
                    });
                }}
                onReset={() => {
                    setQuery({
                        keyword: null,
                        role: null,
                        is_verified: null,
                        page: 1,
                    });
                }}
                columnsState={{
                    persistenceKey: "users-table-columns",
                    persistenceType: "localStorage",
                }}
                scroll={{
                    x: "max-content",
                }}
            />
        </PageContainer>
    );
}

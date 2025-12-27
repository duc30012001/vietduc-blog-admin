import type {
    BulkUpdateOrderItem,
    Category,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "@/modules/categories";
import {
    useBulkUpdateCategoryOrder,
    useCategoryTree,
    useCreateCategory,
    useDeleteCategory,
    useUpdateCategory,
} from "@/modules/categories";
import { PlusOutlined } from "@ant-design/icons";
import {
    ModalForm,
    PageContainer,
    ProCard,
    ProFormText,
    ProFormTextArea,
    ProFormTreeSelect,
} from "@ant-design/pro-components";
import type { TreeDataNode as AntTreeDataNode, TreeProps } from "antd";
import { Button, message, Popconfirm, Space, Spin, Tree, Typography } from "antd";
import type { EventDataNode } from "antd/es/tree";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

interface TreeDataNode extends AntTreeDataNode {
    key: string;
    title: React.ReactNode;
    children?: TreeDataNode[];
    category: Category;
}

interface TreeSelectNode {
    value: string;
    title: string;
    children?: TreeSelectNode[];
}

// Helper function to flatten tree with order (defined outside component to avoid useCallback issues)
const flattenTreeWithOrder = (
    nodes: TreeDataNode[],
    parentId?: string | null
): BulkUpdateOrderItem[] => {
    const items: BulkUpdateOrderItem[] = [];
    nodes.forEach((node, index) => {
        items.push({
            id: node.key,
            parent_id: parentId ?? null,
            order: index,
        });
        if (node.children) {
            items.push(...flattenTreeWithOrder(node.children, node.key));
        }
    });
    return items;
};

export default function CategoryPage() {
    const intl = useIntl();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    // const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    // Queries
    const { data: categories, isLoading, refetch } = useCategoryTree();

    // Mutations
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();
    const bulkUpdateOrderMutation = useBulkUpdateCategoryOrder();

    // Delete handler
    const handleDelete = useCallback(
        async (id: string) => {
            try {
                await deleteMutation.mutateAsync(id);
                message.success(
                    intl.formatMessage(
                        { id: "action.delete.success" },
                        { label: intl.formatMessage({ id: "menu.category" }) }
                    )
                );
            } catch {
                message.error(
                    intl.formatMessage(
                        { id: "action.delete.error" },
                        { label: intl.formatMessage({ id: "menu.category" }) }
                    )
                );
            }
        },
        [deleteMutation, intl]
    );

    // Convert categories to tree data for Ant Design Tree
    const treeData: TreeDataNode[] = useMemo(() => {
        if (!categories) return [];

        const convertToTreeData = (cats: Category[]): TreeDataNode[] => {
            return cats.map((cat) => ({
                key: cat.id,
                title: (
                    <Space size="small">
                        <Typography.Text strong>{cat.name_vi}</Typography.Text>
                        <Typography.Text type="secondary">({cat.name_en})</Typography.Text>
                        <Button
                            type="link"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory(cat);
                                setEditModalOpen(true);
                            }}
                        >
                            {intl.formatMessage({ id: "action.update.button" })}
                        </Button>
                        <Popconfirm
                            title={intl.formatMessage(
                                {
                                    id:
                                        cat.children && cat.children.length > 0
                                            ? "category.delete.alertWithChildren"
                                            : "action.delete.alert",
                                },
                                { label: cat.name_vi }
                            )}
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDelete(cat.id);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                        >
                            <Button
                                type="link"
                                size="small"
                                danger
                                onClick={(e) => e.stopPropagation()}
                            >
                                {intl.formatMessage({ id: "action.delete.button" })}
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
                children: cat.children ? convertToTreeData(cat.children) : undefined,
                category: cat,
            }));
        };

        return convertToTreeData(categories);
    }, [categories, intl, handleDelete]);

    // Convert to flat tree select options
    const treeSelectData: TreeSelectNode[] = useMemo(() => {
        if (!categories) return [];

        const convertToSelectData = (cats: Category[], excludeId?: string): TreeSelectNode[] => {
            return cats
                .filter((cat) => cat.id !== excludeId)
                .map((cat) => ({
                    value: cat.id,
                    title: cat.name_vi,
                    children: cat.children
                        ? convertToSelectData(cat.children, excludeId)
                        : undefined,
                }));
        };

        return convertToSelectData(categories, editingCategory?.id);
    }, [categories, editingCategory]);

    // Handle drag-drop
    const handleDrop: TreeProps<TreeDataNode>["onDrop"] = useCallback(
        async (info: any) => {
            const dropKey = info.node.key as string;
            const dragKey = info.dragNode.key as string;
            const dropPos = info.node.pos.split("-");
            const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

            const loop = (
                data: TreeDataNode[],
                key: React.Key,
                callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void
            ) => {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].key === key) {
                        return callback(data[i], i, data);
                    }
                    if (data[i].children) {
                        loop(data[i].children!, key, callback);
                    }
                }
            };

            const data = [...treeData];

            // Find dragObject
            let dragObj: TreeDataNode | undefined;
            loop(data, dragKey, (item, index, arr) => {
                arr.splice(index, 1);
                dragObj = item;
            });

            if (!dragObj) return;

            if (!info.dropToGap) {
                // Drop on a node (as child)
                loop(data, dropKey, (item) => {
                    item.children = item.children || [];
                    item.children.unshift(dragObj!);
                });
            } else if (
                (info.node as EventDataNode<TreeDataNode> & { expanded?: boolean }).expanded &&
                info.node.children?.length &&
                dropPosition === 1
            ) {
                // Drop at expanded node (insert at first child)
                loop(data, dropKey, (item) => {
                    item.children = item.children || [];
                    item.children.unshift(dragObj!);
                });
            } else {
                // Drop in gap
                let ar: TreeDataNode[] = [];
                let i = 0;
                loop(data, dropKey, (_item, index, arr) => {
                    ar = arr;
                    i = index;
                });
                if (dropPosition === -1) {
                    ar.splice(i, 0, dragObj);
                } else {
                    ar.splice(i + 1, 0, dragObj);
                }
            }

            // Calculate new order and parent_id
            const items = flattenTreeWithOrder(data);

            try {
                await bulkUpdateOrderMutation.mutateAsync({ items });
                message.success(intl.formatMessage({ id: "category.tree.reorderSuccess" }));
            } catch {
                message.error(intl.formatMessage({ id: "category.tree.reorderError" }));
                refetch();
            }
        },
        [treeData, bulkUpdateOrderMutation, intl, refetch]
    );

    // Create handler
    const handleCreate = async (values: CreateCategoryDto) => {
        try {
            await createMutation.mutateAsync(values);
            message.success(
                intl.formatMessage(
                    { id: "action.create.success" },
                    { label: intl.formatMessage({ id: "menu.category" }) }
                )
            );
            setCreateModalOpen(false);
            return true;
        } catch {
            message.error(
                intl.formatMessage(
                    { id: "action.create.error" },
                    { label: intl.formatMessage({ id: "menu.category" }) }
                )
            );
            return false;
        }
    };

    // Update handler
    const handleUpdate = async (values: UpdateCategoryDto) => {
        if (!editingCategory) return false;
        try {
            await updateMutation.mutateAsync({ id: editingCategory.id, data: values });
            message.success(
                intl.formatMessage(
                    { id: "action.update.success" },
                    { label: intl.formatMessage({ id: "menu.category" }) }
                )
            );
            setEditModalOpen(false);
            setEditingCategory(null);
            return true;
        } catch {
            message.error(
                intl.formatMessage(
                    { id: "action.update.error" },
                    { label: intl.formatMessage({ id: "menu.category" }) }
                )
            );
            return false;
        }
    };

    return (
        <PageContainer
            title={intl.formatMessage({ id: "page.category.title" })}
            extra={[
                <Button
                    key="create"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                >
                    {intl.formatMessage({ id: "action.create.button" })}
                </Button>,
            ]}
        >
            <ProCard>
                <Spin spinning={isLoading || bulkUpdateOrderMutation.isPending}>
                    {treeData.length > 0 ? (
                        <Tree<TreeDataNode>
                            className="draggable-tree"
                            draggable
                            blockNode
                            showLine
                            defaultExpandAll
                            // expandedKeys={expandedKeys}
                            // onExpand={setExpandedKeys}
                            treeData={treeData}
                            onDrop={handleDrop}
                        />
                    ) : (
                        !isLoading && (
                            <Typography.Text type="secondary">
                                {intl.formatMessage({ id: "category.tree.empty" })}
                            </Typography.Text>
                        )
                    )}
                </Spin>
            </ProCard>

            {/* Create Modal */}
            <ModalForm<CreateCategoryDto>
                title={intl.formatMessage(
                    { id: "action.create.title" },
                    { label: intl.formatMessage({ id: "menu.category" }) }
                )}
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onFinish={handleCreate}
                modalProps={{ destroyOnClose: true }}
            >
                <ProFormText
                    name="name_vi"
                    label={intl.formatMessage({ id: "category.form.nameVi" })}
                    placeholder={intl.formatMessage({ id: "category.form.nameVi.placeholder" })}
                    rules={[
                        {
                            required: true,
                            message: intl.formatMessage(
                                { id: "validation.required" },
                                { field: intl.formatMessage({ id: "category.form.nameVi" }) }
                            ),
                        },
                    ]}
                />
                <ProFormText
                    name="name_en"
                    label={intl.formatMessage({ id: "category.form.nameEn" })}
                    placeholder={intl.formatMessage({ id: "category.form.nameEn.placeholder" })}
                    rules={[
                        {
                            required: true,
                            message: intl.formatMessage(
                                { id: "validation.required" },
                                { field: intl.formatMessage({ id: "category.form.nameEn" }) }
                            ),
                        },
                    ]}
                />
                <ProFormTextArea
                    name="description"
                    label={intl.formatMessage({ id: "category.form.description" })}
                    placeholder={intl.formatMessage({
                        id: "category.form.description.placeholder",
                    })}
                />
                <ProFormTreeSelect
                    name="parent_id"
                    label={intl.formatMessage({ id: "category.form.parent" })}
                    placeholder={intl.formatMessage({ id: "category.form.parent.placeholder" })}
                    allowClear
                    fieldProps={{
                        treeData: treeSelectData,
                        treeDefaultExpandAll: true,
                    }}
                />
            </ModalForm>

            {/* Edit Modal */}
            <ModalForm<UpdateCategoryDto>
                title={intl.formatMessage(
                    { id: "action.update.title" },
                    { label: intl.formatMessage({ id: "menu.category" }) }
                )}
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);
                    if (!open) setEditingCategory(null);
                }}
                onFinish={handleUpdate}
                modalProps={{ destroyOnClose: true }}
                initialValues={
                    editingCategory
                        ? {
                              name_vi: editingCategory.name_vi,
                              name_en: editingCategory.name_en,
                              description: editingCategory.description,
                              parent_id: editingCategory.parent_id,
                          }
                        : undefined
                }
            >
                <ProFormText
                    name="name_vi"
                    label={intl.formatMessage({ id: "category.form.nameVi" })}
                    placeholder={intl.formatMessage({ id: "category.form.nameVi.placeholder" })}
                    rules={[
                        {
                            required: true,
                            message: intl.formatMessage(
                                { id: "validation.required" },
                                { field: intl.formatMessage({ id: "category.form.nameVi" }) }
                            ),
                        },
                    ]}
                />
                <ProFormText
                    name="name_en"
                    label={intl.formatMessage({ id: "category.form.nameEn" })}
                    placeholder={intl.formatMessage({ id: "category.form.nameEn.placeholder" })}
                    rules={[
                        {
                            required: true,
                            message: intl.formatMessage(
                                { id: "validation.required" },
                                { field: intl.formatMessage({ id: "category.form.nameEn" }) }
                            ),
                        },
                    ]}
                />
                <ProFormTextArea
                    name="description"
                    label={intl.formatMessage({ id: "category.form.description" })}
                    placeholder={intl.formatMessage({
                        id: "category.form.description.placeholder",
                    })}
                />
                <ProFormTreeSelect
                    name="parent_id"
                    label={intl.formatMessage({ id: "category.form.parent" })}
                    placeholder={intl.formatMessage({ id: "category.form.parent.placeholder" })}
                    allowClear
                    fieldProps={{
                        treeData: treeSelectData,
                        treeDefaultExpandAll: true,
                    }}
                />
            </ModalForm>
        </PageContainer>
    );
}

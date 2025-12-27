import { MDEditorWithUpload } from "@/common/components";
import { uploadThumbnail } from "@/common/utils";
import { useCategoryTree } from "@/modules/categories";
import type { CreatePostDto, PostStatus, UpdatePostDto } from "@/modules/posts";
import { useCreatePost, usePost, useUpdatePost } from "@/modules/posts";
import { PATHS } from "@/routes/config";
import {
    PageContainer,
    ProForm,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
} from "@ant-design/pro-components";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Button,
    Card,
    Col,
    Form,
    Image,
    message,
    Row,
    Select,
    Space,
    Spin,
    Tabs,
    TreeSelect,
    Upload,
} from "antd";
import type { RcFile } from "antd/es/upload";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useSearchParams } from "react-router-dom";

const { Dragger } = Upload;

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;
// Allowed image types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface PostFormValues {
    title_vi: string;
    title_en: string;
    excerpt_vi: string;
    excerpt_en: string;
    content_vi: string;
    content_en: string;
    thumbnail?: string;
    status: PostStatus;
    category_id: string;
    tags?: string[];
}

export default function PostFormPage() {
    const intl = useIntl();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const postId = searchParams.get("id");
    const isViewMode = searchParams.get("mode") === "view";
    const isEdit = !!postId;

    const [form] = Form.useForm<PostFormValues>();
    const [contentVi, setContentVi] = useState("");
    const [contentEn, setContentEn] = useState("");
    const [activeTab, setActiveTab] = useState("vi");
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const initializedRef = useRef(false);

    // Queries
    const { data: categories } = useCategoryTree();
    const { data: post, isLoading: isLoadingPost } = usePost(postId || "");

    // Mutations
    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();

    // Initialize form when post data is loaded
    useEffect(() => {
        if (post && isEdit && !initializedRef.current) {
            initializedRef.current = true;
            form.setFieldsValue({
                title_vi: post.title_vi,
                title_en: post.title_en,
                excerpt_vi: post.excerpt_vi ?? "",
                excerpt_en: post.excerpt_en ?? "",
                thumbnail: post.thumbnail ?? undefined,
                status: post.status,
                category_id: post.category_id ?? undefined,
                tags: post.tags?.map((t) => t.name_vi),
            });
            setContentVi(post.content_vi);
            setContentEn(post.content_en);
            if (post.thumbnail) {
                setThumbnailUrl(post.thumbnail);
                setThumbnailPreview(post.thumbnail);
            }
        }
    }, [post, isEdit, form]);

    // Validate file before adding
    const validateFile = (file: RcFile): boolean => {
        // Check file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            message.error(intl.formatMessage({ id: "upload.invalidType" }));
            return false;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            message.error(intl.formatMessage({ id: "upload.maxSize" }, { size: "2MB" }));
            return false;
        }

        return true;
    };

    // Handle file selection (no upload yet)
    const handleFileSelect = (file: RcFile): boolean => {
        if (!validateFile(file)) {
            return false;
        }

        // Store file for later upload
        setThumbnailFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
        setThumbnailUrl(""); // Clear existing URL since we have a new file

        return false; // Prevent automatic upload
    };

    // Remove thumbnail
    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview("");
        setThumbnailUrl("");
        form.setFieldValue("thumbnail", "");
    };

    const handleSubmit = async (values: PostFormValues) => {
        // Validate required fields manually for better UX
        if (!values.title_vi) {
            message.error(
                intl.formatMessage(
                    { id: "validation.required" },
                    { field: intl.formatMessage({ id: "post.form.titleVi" }) }
                )
            );
            setActiveTab("vi");
            return;
        }
        if (!values.title_en) {
            message.error(
                intl.formatMessage(
                    { id: "validation.required" },
                    { field: intl.formatMessage({ id: "post.form.titleEn" }) }
                )
            );
            setActiveTab("en");
            return;
        }
        if (!contentVi) {
            message.error(
                intl.formatMessage(
                    { id: "validation.required" },
                    { field: intl.formatMessage({ id: "post.form.contentVi" }) }
                )
            );
            setActiveTab("vi");
            return;
        }
        if (!contentEn) {
            message.error(
                intl.formatMessage(
                    { id: "validation.required" },
                    { field: intl.formatMessage({ id: "post.form.contentEn" }) }
                )
            );
            setActiveTab("en");
            return;
        }

        setSubmitting(true);

        try {
            // Upload thumbnail if new file selected
            let finalThumbnailUrl = thumbnailUrl;
            if (thumbnailFile) {
                try {
                    finalThumbnailUrl = await uploadThumbnail(thumbnailFile);
                    message.success(intl.formatMessage({ id: "upload.success" }));
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : intl.formatMessage({ id: "upload.error" });
                    message.error(`${intl.formatMessage({ id: "upload.error" })}: ${errorMessage}`);
                    setSubmitting(false);
                    return;
                }
            }

            const data: CreatePostDto | UpdatePostDto = {
                ...values,
                content_vi: contentVi,
                content_en: contentEn,
                thumbnail: finalThumbnailUrl || undefined,
            };

            if (isEdit && postId) {
                await updateMutation.mutateAsync({ id: postId, data });
                message.success(
                    intl.formatMessage(
                        { id: "action.update.success" },
                        { label: intl.formatMessage({ id: "menu.post" }) }
                    )
                );
            } else {
                await createMutation.mutateAsync(data as CreatePostDto);
                message.success(
                    intl.formatMessage(
                        { id: "action.create.success" },
                        { label: intl.formatMessage({ id: "menu.post" }) }
                    )
                );
            }
            navigate(PATHS.POST);
        } catch {
            message.error(
                intl.formatMessage(
                    { id: isEdit ? "action.update.error" : "action.create.error" },
                    { label: intl.formatMessage({ id: "menu.post" }) }
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Convert categories to tree data for TreeSelect
    interface TreeNode {
        title: string;
        value: string;
        children?: TreeNode[];
    }

    const categoryTreeData = useMemo((): TreeNode[] => {
        if (!categories) return [];

        const buildTree = (cats: typeof categories): TreeNode[] => {
            return cats.map((cat) => ({
                title: cat.name_vi,
                value: cat.id,
                children: cat.children ? buildTree(cat.children) : undefined,
            }));
        };

        return buildTree(categories);
    }, [categories]);

    const statusOptions = [
        { label: intl.formatMessage({ id: "post.status.draft" }), value: "DRAFT" },
        { label: intl.formatMessage({ id: "post.status.published" }), value: "PUBLISHED" },
        { label: intl.formatMessage({ id: "post.status.archived" }), value: "ARCHIVED" },
    ];

    const pageTitle = isViewMode
        ? intl.formatMessage({ id: "post.form.viewTitle" })
        : isEdit
          ? intl.formatMessage(
                { id: "action.update.title" },
                { label: intl.formatMessage({ id: "menu.post" }) }
            )
          : intl.formatMessage(
                { id: "action.create.title" },
                { label: intl.formatMessage({ id: "menu.post" }) }
            );

    if (isEdit && isLoadingPost) {
        return (
            <PageContainer title={pageTitle}>
                <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
                    <Spin size="large" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer title={pageTitle} onBack={() => navigate(PATHS.POST)}>
            <ProForm<PostFormValues>
                form={form}
                onFinish={handleSubmit}
                submitter={
                    isViewMode
                        ? false
                        : {
                              render: (_, dom) => (
                                  <Space style={{ marginTop: 10 }}>
                                      <Button onClick={() => navigate(PATHS.POST)}>
                                          {intl.formatMessage({ id: "action.cancel.button" })}
                                      </Button>
                                      {dom[1]}
                                  </Space>
                              ),
                              searchConfig: {
                                  submitText: intl.formatMessage({ id: "action.save.button" }),
                              },
                              submitButtonProps: {
                                  loading: submitting,
                              },
                          }
                }
                initialValues={{ status: "DRAFT" }}
                disabled={isViewMode || submitting}
            >
                <Row gutter={24}>
                    <Col span={18}>
                        <Card title={intl.formatMessage({ id: "post.form.content" })}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                items={[
                                    {
                                        key: "vi",
                                        forceRender: true,
                                        label: intl.formatMessage({ id: "post.form.vietnamese" }),
                                        children: (
                                            <>
                                                <ProFormText
                                                    name="title_vi"
                                                    label={intl.formatMessage({
                                                        id: "post.form.titleVi",
                                                    })}
                                                    placeholder={intl.formatMessage({
                                                        id: "post.form.titleVi.placeholder",
                                                    })}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: intl.formatMessage(
                                                                { id: "validation.required" },
                                                                {
                                                                    field: intl.formatMessage({
                                                                        id: "post.form.titleVi",
                                                                    }),
                                                                }
                                                            ),
                                                        },
                                                    ]}
                                                />
                                                <ProFormTextArea
                                                    name="excerpt_vi"
                                                    label={intl.formatMessage({
                                                        id: "post.form.excerptVi",
                                                    })}
                                                    placeholder={intl.formatMessage({
                                                        id: "post.form.excerptVi.placeholder",
                                                    })}
                                                    fieldProps={{ rows: 3 }}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: intl.formatMessage(
                                                                { id: "validation.required" },
                                                                {
                                                                    field: intl.formatMessage({
                                                                        id: "post.form.excerptVi",
                                                                    }),
                                                                }
                                                            ),
                                                        },
                                                    ]}
                                                />
                                                <Form.Item
                                                    label={intl.formatMessage({
                                                        id: "post.form.contentVi",
                                                    })}
                                                    required
                                                >
                                                    <MDEditorWithUpload
                                                        value={contentVi}
                                                        onChange={setContentVi}
                                                        height={400}
                                                        preview={isViewMode ? "preview" : "live"}
                                                        disabled={isViewMode}
                                                    />
                                                </Form.Item>
                                            </>
                                        ),
                                    },
                                    {
                                        key: "en",
                                        forceRender: true,
                                        label: intl.formatMessage({ id: "post.form.english" }),
                                        children: (
                                            <>
                                                <ProFormText
                                                    name="title_en"
                                                    label={intl.formatMessage({
                                                        id: "post.form.titleEn",
                                                    })}
                                                    placeholder={intl.formatMessage({
                                                        id: "post.form.titleEn.placeholder",
                                                    })}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: intl.formatMessage(
                                                                { id: "validation.required" },
                                                                {
                                                                    field: intl.formatMessage({
                                                                        id: "post.form.titleEn",
                                                                    }),
                                                                }
                                                            ),
                                                        },
                                                    ]}
                                                />
                                                <ProFormTextArea
                                                    name="excerpt_en"
                                                    label={intl.formatMessage({
                                                        id: "post.form.excerptEn",
                                                    })}
                                                    placeholder={intl.formatMessage({
                                                        id: "post.form.excerptEn.placeholder",
                                                    })}
                                                    fieldProps={{ rows: 3 }}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: intl.formatMessage(
                                                                { id: "validation.required" },
                                                                {
                                                                    field: intl.formatMessage({
                                                                        id: "post.form.excerptEn",
                                                                    }),
                                                                }
                                                            ),
                                                        },
                                                    ]}
                                                />
                                                <Form.Item
                                                    label={intl.formatMessage({
                                                        id: "post.form.contentEn",
                                                    })}
                                                    required
                                                >
                                                    <MDEditorWithUpload
                                                        value={contentEn}
                                                        onChange={setContentEn}
                                                        height={400}
                                                        preview={isViewMode ? "preview" : "live"}
                                                        disabled={isViewMode}
                                                    />
                                                </Form.Item>
                                            </>
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={intl.formatMessage({ id: "post.form.settings" })}>
                            <ProFormSelect
                                name="status"
                                label={intl.formatMessage({ id: "post.form.status" })}
                                options={statusOptions}
                                rules={[{ required: true }]}
                            />
                            <Form.Item
                                name="category_id"
                                label={intl.formatMessage({ id: "post.form.category" })}
                                rules={[
                                    {
                                        required: true,
                                        message: intl.formatMessage(
                                            { id: "validation.required" },
                                            {
                                                field: intl.formatMessage({
                                                    id: "post.form.category",
                                                }),
                                            }
                                        ),
                                    },
                                ]}
                            >
                                <TreeSelect
                                    placeholder={intl.formatMessage({
                                        id: "post.form.category.placeholder",
                                    })}
                                    treeData={categoryTreeData}
                                    showSearch
                                    treeNodeFilterProp="title"
                                    treeDefaultExpandAll
                                />
                            </Form.Item>

                            {/* Tag Selection */}
                            <Form.Item
                                name="tags"
                                label={intl.formatMessage({ id: "post.form.tags" })}
                            >
                                <Select
                                    mode="tags"
                                    placeholder={intl.formatMessage({
                                        id: "post.form.tags.placeholder",
                                    })}
                                    tokenSeparators={[","]}
                                    disabled={isViewMode}
                                />
                            </Form.Item>

                            {/* Thumbnail Upload */}
                            <Form.Item
                                label={intl.formatMessage({ id: "post.form.thumbnail" })}
                                name="thumbnail"
                            >
                                {thumbnailPreview ? (
                                    <div style={{ position: "relative" }}>
                                        <Image
                                            src={thumbnailPreview}
                                            alt="Thumbnail"
                                            style={{ width: "100%", borderRadius: 8 }}
                                        />
                                        {!isViewMode && (
                                            <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteIcon />}
                                                size="small"
                                                style={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                }}
                                                onClick={handleRemoveThumbnail}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    !isViewMode && (
                                        <Dragger
                                            name="file"
                                            multiple={false}
                                            showUploadList={false}
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            beforeUpload={handleFileSelect}
                                            disabled={submitting}
                                        >
                                            <p className="ant-upload-drag-icon">
                                                <CloudUploadIcon
                                                    style={{ fontSize: 48, color: "#1890ff" }}
                                                />
                                            </p>
                                            <p className="ant-upload-text">
                                                {intl.formatMessage({ id: "upload.dragText" })}
                                            </p>
                                            <p className="ant-upload-hint">
                                                {intl.formatMessage({ id: "upload.hint" })}
                                            </p>
                                        </Dragger>
                                    )
                                )}
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </ProForm>
        </PageContainer>
    );
}

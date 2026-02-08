import { PlusOutlined } from "@ant-design/icons";
import { Image, message, Upload, type UploadFile, type UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { useState } from "react";
import { useIntl } from "react-intl";
import { uploadThumbnail } from "../utils";

interface UploadImageProps {
    value?: string;
    onChange?: (url: string) => void;
    onFileSelect?: (file: File) => void;
    maxSize?: number; // In bytes, default 2MB
    allowedTypes?: string[];
    listType?: "picture-card" | "picture-circle";
    placeholder?: string;
}

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;
const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function UploadImage({
    value,
    onChange,
    onFileSelect,
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    listType = "picture-card",
    placeholder,
}: UploadImageProps) {
    const intl = useIntl();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    // Derive fileList from value prop
    const fileList: UploadFile[] = value
        ? [
              {
                  uid: "-1",
                  name: "image.png",
                  status: "done",
                  url: value,
              },
          ]
        : [];

    const handlePreview = async (file: UploadFile) => {
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
        // We only care about the latest file for now as we use maxCount=1
        if (newFileList.length === 0 && onChange) {
            onChange("");
        }
    };

    const beforeUpload = async (file: RcFile) => {
        const isAllowedType = allowedTypes.includes(file.type);
        if (!isAllowedType) {
            message.error(intl.formatMessage({ id: "upload.error.type" }));
            return Upload.LIST_IGNORE;
        }
        const isLtSize = file.size <= maxSize;
        if (!isLtSize) {
            message.error(
                intl.formatMessage(
                    { id: "upload.error.size" },
                    { size: `${maxSize / 1024 / 1024}MB` }
                )
            );
            return Upload.LIST_IGNORE;
        }

        // Handle file selection
        if (onFileSelect) {
            onFileSelect(file);
        }

        const imageUrl = await uploadThumbnail(file);
        onChange?.(imageUrl);

        return imageUrl;
    };

    const handleRemove = () => {
        if (onChange) {
            onChange("");
        }
        if (onFileSelect) {
            // @ts-expect-error - reset file
            onFileSelect(null);
        }
    };

    const uploadButton = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>
                {placeholder || intl.formatMessage({ id: "action.upload.button" })}
            </div>
        </div>
    );

    return (
        <>
            <Upload
                listType={listType}
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                maxCount={1}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
                <Image
                    wrapperStyle={{ display: "none" }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                />
            )}
        </>
    );
}

import { uploadImage } from "@/common/utils/storage";
import ImageIcon from "@mui/icons-material/Image";
import MDEditor, { commands, type ICommand } from "@uiw/react-md-editor";
import { message, Spin } from "antd";
import { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";

interface MDEditorWithUploadProps {
    value: string;
    onChange: (value: string) => void;
    height?: number;
    preview?: "live" | "edit" | "preview";
    disabled?: boolean;
}

export function MDEditorWithUpload({
    value,
    onChange,
    height = 400,
    preview = "live",
    disabled = false,
}: MDEditorWithUploadProps) {
    const intl = useIntl();
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Insert text at cursor position
    const insertAtCursor = useCallback(
        (text: string) => {
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.substring(0, start) + text + value.substring(end);
                onChange(newValue);
                // Set cursor position after inserted text
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + text.length;
                    textarea.focus();
                }, 0);
            } else {
                // Fallback: append at end
                onChange(value + text);
            }
        },
        [value, onChange]
    );

    // Handle file upload
    const handleUpload = useCallback(
        async (file: File) => {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                message.error(intl.formatMessage({ id: "upload.invalidType" }));
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                message.error(intl.formatMessage({ id: "upload.maxSize" }, { size: "5MB" }));
                return;
            }

            setUploading(true);
            try {
                const url = await uploadImage(file, "images");
                const markdown = `![${file.name}](${url})`;
                insertAtCursor(markdown + "\n");
                message.success(intl.formatMessage({ id: "upload.success" }));
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : intl.formatMessage({ id: "upload.error" });
                message.error(`${intl.formatMessage({ id: "upload.error" })}: ${errorMessage}`);
            } finally {
                setUploading(false);
            }
        },
        [insertAtCursor, intl]
    );

    // Handle paste event
    const handlePaste = useCallback(
        (event: React.ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        handleUpload(file);
                    }
                    break;
                }
            }
        },
        [handleUpload]
    );

    // Handle drop event
    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return;

            const file = files[0];
            if (file.type.startsWith("image/")) {
                event.preventDefault();
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    // Handle file input change
    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                handleUpload(file);
            }
            // Reset input
            event.target.value = "";
        },
        [handleUpload]
    );

    // Custom image upload command
    const imageUploadCommand: ICommand = {
        name: "image-upload",
        keyCommand: "image-upload",
        buttonProps: { "aria-label": "Upload image", title: "Upload image (Ctrl+Shift+I)" },
        icon: <ImageIcon fontSize="small" style={{ width: 12, height: 12 }} />,
        execute: () => {
            fileInputRef.current?.click();
        },
    };

    return (
        <Spin spinning={uploading} tip={intl.formatMessage({ id: "upload.uploading" })}>
            <div
                data-color-mode="light"
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <MDEditor
                    value={value}
                    onChange={(val) => onChange(val || "")}
                    height={height}
                    preview={disabled ? "preview" : preview}
                    commands={[
                        commands.bold,
                        commands.italic,
                        commands.strikethrough,
                        commands.hr,
                        commands.divider,
                        commands.title,
                        commands.link,
                        commands.quote,
                        commands.code,
                        commands.codeBlock,
                        commands.divider,
                        commands.unorderedListCommand,
                        commands.orderedListCommand,
                        commands.checkedListCommand,
                        commands.divider,
                        imageUploadCommand,
                        commands.image,
                        commands.table,
                    ]}
                    textareaProps={{
                        disabled,
                    }}
                />
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                />
            </div>
        </Spin>
    );
}

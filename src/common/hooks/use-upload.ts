import { uploadThumbnail } from "@/common/utils";
import { message } from "antd";
import { useState } from "react";
import { useIntl } from "react-intl";

interface UseUploadOptions {
    onSuccess?: (url: string) => void;
    onError?: (error: Error) => void;
}

export function useUpload(options?: UseUploadOptions) {
    const intl = useIntl();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadImage = async (file: File): Promise<string | null> => {
        setUploading(true);
        setProgress(0);

        try {
            // Simulate progress for UX
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const url = await uploadThumbnail(file);

            clearInterval(progressInterval);
            setProgress(100);

            message.success(intl.formatMessage({ id: "upload.success" }));
            options?.onSuccess?.(url);

            return url;
        } catch (error) {
            message.error(intl.formatMessage({ id: "upload.error" }));
            options?.onError?.(error as Error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        progress,
        uploadImage,
    };
}

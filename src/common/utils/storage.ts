import { storage } from "@/config/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

/**
 * Upload an image to Firebase Storage
 * @param file - The file to upload
 * @param path - The path in storage (e.g., "posts/thumbnails")
 * @returns The public download URL
 */
export async function uploadImage(file: File, path: string = "uploads"): Promise<string> {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
}

/**
 * Delete an image from Firebase Storage by URL
 * @param url - The download URL of the image
 */
export async function deleteImage(url: string): Promise<void> {
    try {
        // Extract path from URL
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Failed to delete image:", error);
    }
}

/**
 * Upload a thumbnail for a post
 * @param file - The image file
 * @returns The public download URL
 */
export async function uploadThumbnail(file: File): Promise<string> {
    return uploadImage(file, "images");
}

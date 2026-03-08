const CLIENT_URL = import.meta.env.VITE_CLIENT_URL as string;
const REVALIDATION_SECRET = import.meta.env.VITE_REVALIDATION_SECRET as string;

/**
 * Call the client's revalidation endpoint to purge Next.js cache for given tags.
 * Accepts one or more cache tag names. All requests fire in parallel.
 * Silently catches errors — cache invalidation should never block the admin UI.
 */
export async function revalidateClient(...tags: string[]): Promise<void> {
    if (!CLIENT_URL || !REVALIDATION_SECRET) {
        console.warn("[Revalidate] Missing VITE_CLIENT_URL or VITE_REVALIDATION_SECRET");
        return;
    }

    const requests = tags.map(async (tag) => {
        try {
            const url = `${CLIENT_URL}/api/revalidate?secret=${encodeURIComponent(REVALIDATION_SECRET)}&tag=${encodeURIComponent(tag)}`;
            const res = await fetch(url, { method: "POST" });

            if (!res.ok) {
                console.error(`[Revalidate] Failed for "${tag}": ${res.status} ${res.statusText}`);
            }
        } catch (error) {
            console.error(`[Revalidate] Error for "${tag}":`, error);
        }
    });

    await Promise.allSettled(requests);
}

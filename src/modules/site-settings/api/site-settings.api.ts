import type { ApiResponse } from "@/common/types";
import axiosClient from "@/config/axios";
import type {
    BrandSettingsValue,
    FooterContactEmailValue,
    FooterSocialLinksValue,
    SiteSetting,
} from "../types";

const ENDPOINT = "/site-settings";

export const siteSettingsApi = {
    /**
     * Get all site settings (admin only)
     */
    getAll: async (): Promise<SiteSetting[]> => {
        const response = await axiosClient.get<ApiResponse<SiteSetting[]>>(ENDPOINT);
        return response.data.data;
    },

    /**
     * Get setting by key
     */
    getByKey: async (key: string): Promise<SiteSetting> => {
        const response = await axiosClient.get<ApiResponse<SiteSetting>>(`${ENDPOINT}/${key}`);
        return response.data.data;
    },

    /**
     * Update or create footer social links setting
     */
    updateSocialLinks: async (value: FooterSocialLinksValue): Promise<SiteSetting> => {
        const response = await axiosClient.put<ApiResponse<SiteSetting>>(
            `${ENDPOINT}/footer_social_links`,
            { value }
        );
        return response.data.data;
    },

    /**
     * Update or create footer contact email setting
     */
    updateContactEmail: async (value: FooterContactEmailValue): Promise<SiteSetting> => {
        const response = await axiosClient.put<ApiResponse<SiteSetting>>(
            `${ENDPOINT}/footer_contact_email`,
            { value }
        );
        return response.data.data;
    },

    /**
     * Update or create brand settings
     */
    updateBrandSettings: async (value: BrandSettingsValue): Promise<SiteSetting> => {
        const response = await axiosClient.put<ApiResponse<SiteSetting>>(
            `${ENDPOINT}/brand_settings`,
            { value }
        );
        return response.data.data;
    },
};

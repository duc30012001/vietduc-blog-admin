export interface SocialLink {
    logo: string; // URL to icon/logo image
    name: string; // Display name
    url: string; // Link URL
    enabled: boolean;
}

export interface FooterSocialLinksValue {
    links: SocialLink[];
}

export interface FooterContactEmailValue {
    email: string;
}

export interface SiteSetting {
    id: string;
    key: string;
    value: unknown;
    created_at: string;
    updated_at: string;
}

export interface FooterSettings {
    socialLinks: SocialLink[];
    contactEmail: string;
}

export interface BrandSettingsValue {
    logo: string;
    title: string;
    shortIntroVi: string;
    shortIntroEn: string;
    fullIntroVi: string;
    fullIntroEn: string;
    contactEmail: string;
}

export const SITE_SETTING_KEYS = {
    FOOTER_SOCIAL_LINKS: "footer_social_links",
    FOOTER_CONTACT_EMAIL: "footer_contact_email",
    BRAND_SETTINGS: "brand_settings",
} as const;

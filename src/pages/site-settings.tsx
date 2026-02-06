import {
    SITE_SETTING_KEYS,
    siteSettingsApi,
    type BrandSettingsValue,
    type FooterSocialLinksValue,
} from "@/modules/site-settings";
import { BrandSettingsTab } from "@/modules/site-settings/components/brand-settings-tab";
import { SocialLinksTab } from "@/modules/site-settings/components/social-links-tab";
import { GlobalOutlined, ShareAltOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { Space, Tabs } from "antd";
import { useIntl } from "react-intl";

export default function SiteSettingsPage() {
    const intl = useIntl();

    // Fetch all settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ["site-settings"],
        queryFn: siteSettingsApi.getAll,
    });

    // Parse settings
    const brandSetting = settings?.find((s) => s.key === SITE_SETTING_KEYS.BRAND_SETTINGS);
    const socialLinksSetting = settings?.find(
        (s) => s.key === SITE_SETTING_KEYS.FOOTER_SOCIAL_LINKS
    );
    const contactEmailSetting = settings?.find(
        (s) => s.key === SITE_SETTING_KEYS.FOOTER_CONTACT_EMAIL
    );

    const brandValue = brandSetting?.value as BrandSettingsValue | undefined;
    const socialLinksValue = socialLinksSetting?.value as FooterSocialLinksValue | undefined;
    const contactEmailValue = contactEmailSetting?.value as { email: string } | undefined;

    // Tab items with Pro Max styling
    const tabItems = [
        {
            key: "brand",
            label: (
                <Space>
                    <GlobalOutlined />
                    {intl.formatMessage({ id: "siteSettings.tab.brand" })}
                </Space>
            ),
            children: (
                <BrandSettingsTab
                    brandValue={brandValue}
                    contactEmailValue={contactEmailValue}
                    isLoading={isLoading}
                />
            ),
        },
        {
            key: "social",
            label: (
                <Space>
                    <ShareAltOutlined />
                    {intl.formatMessage({ id: "siteSettings.tab.social" })}
                </Space>
            ),
            children: <SocialLinksTab socialLinksValue={socialLinksValue} isLoading={isLoading} />,
        },
    ];

    return (
        <PageContainer
            title={intl.formatMessage({ id: "siteSettings.title" })}
            subTitle={intl.formatMessage({ id: "siteSettings.description" })}
        >
            <Tabs items={tabItems} defaultActiveKey="brand" className="pro-tabs" />
        </PageContainer>
    );
}

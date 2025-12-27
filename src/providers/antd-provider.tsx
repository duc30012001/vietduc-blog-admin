import { useTheme } from "@/contexts";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import type { ReactNode } from "react";

interface AntdProviderProps {
    children: ReactNode;
}

export const AntdProvider = ({ children }: AntdProviderProps) => {
    const { algorithm } = useTheme();
    const { token } = theme.useToken();

    return (
        <ConfigProvider
            locale={viVN}
            theme={{ algorithm }}
            form={{
                colon: false,
                requiredMark: (label, { required }) => (
                    <>
                        {label}
                        {required && (
                            <span style={{ color: token.colorError, marginLeft: 4 }}>*</span>
                        )}
                    </>
                ),
            }}
        >
            {children}
        </ConfigProvider>
    );
};

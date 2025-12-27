import { appConfig } from "@/config/app";
import { useAuth } from "@/contexts/auth-context";
import { useTheme, type ThemeMode } from "@/contexts/theme-context";
import { PATHS } from "@/routes/config";
import { ProLayout } from "@ant-design/pro-components";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/Logout";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { useIntl } from "react-intl";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const menuConfig = [
    {
        path: PATHS.DASHBOARD,
        nameKey: "menu.dashboard",
        icon: <DashboardOutlinedIcon fontSize="small" />,
    },
    {
        path: PATHS.USER,
        nameKey: "menu.user",
        icon: <PersonOutlinedIcon fontSize="small" />,
    },
    {
        path: PATHS.TAG,
        nameKey: "menu.tag",
        icon: <LocalOfferOutlinedIcon fontSize="small" />,
    },
    {
        path: PATHS.CATEGORY,
        nameKey: "menu.category",
        icon: <CategoryOutlinedIcon fontSize="small" />,
    },
    {
        path: PATHS.POST,
        nameKey: "menu.post",
        icon: <ArticleOutlinedIcon fontSize="small" />,
    },
    {
        path: PATHS.COMMENT,
        nameKey: "menu.comment",
        icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" />,
    },
];

const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
        case "light":
            return <LightModeOutlinedIcon style={{ fontSize: 20 }} />;
        case "dark":
            return <DarkModeOutlinedIcon style={{ fontSize: 20 }} />;
        case "system":
            return <ComputerOutlinedIcon style={{ fontSize: 20 }} />;
    }
};

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const intl = useIntl();
    const { user, signOut } = useAuth();
    const { mode, setMode } = useTheme();

    const menuItems = menuConfig.map((item) => ({
        path: item.path,
        name: intl.formatMessage({ id: item.nameKey }),
        icon: item.icon,
    }));

    const themeMenuItems: MenuProps["items"] = [
        {
            key: "light",
            label: intl.formatMessage({ id: "theme.light" }),
            icon: <LightModeOutlinedIcon style={{ fontSize: 18 }} />,
            onClick: () => setMode("light"),
        },
        {
            key: "dark",
            label: intl.formatMessage({ id: "theme.dark" }),
            icon: <DarkModeOutlinedIcon style={{ fontSize: 18 }} />,
            onClick: () => setMode("dark"),
        },
        {
            key: "system",
            label: intl.formatMessage({ id: "theme.system" }),
            icon: <ComputerOutlinedIcon style={{ fontSize: 18 }} />,
            onClick: () => setMode("system"),
        },
    ];

    const handleLogout = async () => {
        await signOut();
        navigate(PATHS.LOGIN);
    };

    const userMenuItems: MenuProps["items"] = [
        {
            key: "profile",
            label: intl.formatMessage({ id: "user.profile" }),
            icon: <PersonOutlinedIcon style={{ fontSize: 18 }} />,
            onClick: () => navigate(PATHS.DASHBOARD),
        },
        { type: "divider" },
        {
            key: "logout",
            label: intl.formatMessage({ id: "user.logout" }),
            icon: <LogoutOutlinedIcon style={{ fontSize: 18 }} />,
            onClick: handleLogout,
        },
    ];

    return (
        <ProLayout
            layout="mix"
            title={appConfig.name}
            logo={appConfig.logo}
            location={location}
            fixedHeader
            headerTitleRender={(logo, title) => (
                <Link to={PATHS.HOME} style={{ display: "flex", alignItems: "center" }}>
                    {logo}
                    {title}
                </Link>
            )}
            actionsRender={() => [
                <Dropdown
                    key="theme"
                    menu={{ items: themeMenuItems, selectedKeys: [mode] }}
                    trigger={["click"]}
                >
                    <span style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                        {getThemeIcon(mode)}
                    </span>
                </Dropdown>,
            ]}
            avatarProps={{
                src: user?.photoURL || undefined,
                title: user?.displayName || user?.email || "User",
                size: "small",
                render: (_, avatar) => (
                    <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                        {avatar}
                    </Dropdown>
                ),
            }}
            route={{
                path: PATHS.HOME,
                routes: menuItems,
            }}
            menuItemRender={(item, dom) => (
                <Link
                    to={item.path || PATHS.HOME}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                    {dom}
                </Link>
            )}
            menuDataRender={() => menuItems}
        >
            <Outlet />
        </ProLayout>
    );
}

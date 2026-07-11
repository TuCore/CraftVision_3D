export const dictionaries = {
  vi: {
    // Navigation (AppShell)
    "nav.home": "Trang chủ",
    "nav.shop": "Cửa hàng",
    "nav.ai": "Trợ lý AI",
    "nav.profile": "Hồ sơ",
    "nav.cart": "Giỏ hàng",
    "nav.logout": "Đăng xuất",

    // Settings Sidebar
    "settings.account": "Tài khoản",
    "settings.notifications": "Thông báo",
    "settings.security": "Bảo mật",
    "settings.appearance": "Giao diện",
    "settings.ai_assistant": "Trợ lý AI",
    "settings.billing": "Thanh toán",
    "settings.language": "Ngôn ngữ",

    // Settings - Language Tab
    "settings.lang_region": "Ngôn ngữ & Khu vực",
    "settings.lang_label": "Ngôn ngữ",
    "settings.timezone": "Múi giờ",
    "settings.currency": "Tiền tệ",

    // Danger Zone
    "settings.danger_zone": "Vùng nguy hiểm",
    "settings.danger_desc": "Xoá tài khoản sẽ xoá toàn bộ dự án và không thể khôi phục.",
    "settings.delete_account": "Xoá tài khoản",
  },
  en: {
    // Navigation (AppShell)
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.ai": "AI Assistant",
    "nav.profile": "Profile",
    "nav.cart": "Cart",
    "nav.logout": "Logout",

    // Settings Sidebar
    "settings.account": "Account",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.appearance": "Appearance",
    "settings.ai_assistant": "AI Assistant",
    "settings.billing": "Billing",
    "settings.language": "Language",

    // Settings - Language Tab
    "settings.lang_region": "Language & Region",
    "settings.lang_label": "Language",
    "settings.timezone": "Timezone",
    "settings.currency": "Currency",

    // Danger Zone
    "settings.danger_zone": "Danger Zone",
    "settings.danger_desc": "Deleting your account will remove all projects and cannot be undone.",
    "settings.delete_account": "Delete Account",
  }
};

export type Language = keyof typeof dictionaries;
export type TranslationKey = keyof typeof dictionaries.vi;

export const dictionaries = {
  vi: {
    "nav.home": "Trang chủ",
    "nav.shop": "Cửa hàng",
    "nav.ai": "Vision plus",
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
    "settings.danger_desc": "Xoá tài khoản sẽ vô hiệu hoá tài khoản của bạn và không thể khôi phục.",
    "settings.delete_account": "Xoá tài khoản",
    "settings.confirm_delete_title": "Bạn có chắc chắn muốn xoá tài khoản?",
    "settings.confirm_delete_desc": "Hành động này sẽ vô hiệu hoá tài khoản của bạn. Bạn sẽ bị đăng xuất khỏi hệ thống và không thể tiếp tục truy cập dữ liệu cá nhân.",
    "settings.cancel": "Huỷ",
    "settings.confirm_delete_btn": "Xác nhận xoá tài khoản",
    "settings.deleting": "Đang xoá...",
  },
  en: {
    // Navigation (AppShell)
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.ai": "Vision plus",
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
    "settings.danger_desc": "Deleting your account will deactivate your account and cannot be undone.",
    "settings.delete_account": "Delete Account",
    "settings.confirm_delete_title": "Are you sure you want to delete your account?",
    "settings.confirm_delete_desc": "This action will deactivate your account. You will be logged out and lose access to your personal data.",
    "settings.cancel": "Cancel",
    "settings.confirm_delete_btn": "Yes, Delete Account",
    "settings.deleting": "Deleting...",
  }
};

export type Language = keyof typeof dictionaries;
export type TranslationKey = keyof typeof dictionaries.vi;

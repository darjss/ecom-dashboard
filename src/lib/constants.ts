import {
  Home,
  ShoppingCart,
  Package,
  BarChart2,
  Tags,
  FolderTree,
  Users,
  Settings,
} from "lucide-react";

export const status = ["active", "draft", "out_of_stock"] as const;

export const PRODUCT_PER_PAGE=5;

export const sideNavitems = [
  {
    title: "Home",
    url: "/",
    icon: Home, // Home icon for dashboard home
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart, // Shopping cart for orders
  },
  {
    title: "Products",
    url: "/products",
    icon: Package, // Package icon for products
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart2, // Bar chart for analytics
  },
  {
    title: "Brands",
    url: "/brands",
    icon: Tags, // Tags icon for brands
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderTree, // Folder tree for categories
  },
  {
    title: "Users",
    url: "/users",
    icon: Users, // Users icon for user management
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings, // Settings icon remains the same
  },
];

export const amazonHeaders = {
  Host: "www.amazon.com",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/jxl,image/webp,image/png,image/svg+xml,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  Referer: "https://www.amazon.com/",
  DNT: "1",
  "Sec-GPC": "1",
  Connection: "keep-alive",
  Cookie:
    "csm-sid=440-9292188-2387355; session-id=134-3864391-8956557; session-id-time=2082787201l; i18n-prefs=USD",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  Priority: "u=0, i",
};

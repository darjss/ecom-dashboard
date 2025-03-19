import {
  Home,
  ShoppingCart,
  Package,
  BarChart2,
  Tags,
  FolderTree,
  Users,
  Settings,
  CreditCard,
} from "lucide-react";

export const status = ["active", "draft", "out_of_stock"] as const;

export const orderStatus = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
] as const;

export const paymentProvider = ["qpay", "transfer", "cash"] as const;

export const deliveryProvider= ["tu-delivery", "self", "avidaa"] as const;

export const paymentStatus = ["pending", "success", "failed"] as const;

export const PRODUCT_PER_PAGE = 5;

export const sideNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,   },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,   },
  {
    title: "Products",
    url: "/products",
    icon: Package,   },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart2,   },
  {
    title: "Purchases", 
    url: "/purchases",
    icon: CreditCard,   },
  {
    title: "Brands",
    url: "/brands",
    icon: Tags,   },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderTree,   },
  {
    title: "Users",
    url: "/users",
    icon: Users,   },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,   },
];

export const amazonHeaders = {
  Host: "www.amazon.com",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/jxl,image/webp,image/png,image/svg+xml,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  // Referer: "https:  DNT: "1",
  // "Sec-GPC": "1",
  Connection: "keep-alive",
  Cookie:
    "csm-sid=440-9292188-2387355; session-id=134-3864391-8956557; session-id-time=2082787201l; i18n-prefs=USD",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  Priority: "u=0, i",
};

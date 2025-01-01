import { 
    Home,
    ShoppingCart,
    Package,
    BarChart2,
    Tags,
    FolderTree,
    Users,
    Settings
  } from "lucide-react"

export const sideNavitems = [
    {
      title: "Home",
      url: "/",
      icon: Home,  // Home icon for dashboard home
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCart,  // Shopping cart for orders
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,  // Package icon for products
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart2,  // Bar chart for analytics
    },
    {
      title: "Brands",
      url: "/brands",
      icon: Tags,  // Tags icon for brands
    },
    {
      title: "Categories",
      url: "/categories",
      icon: FolderTree,  // Folder tree for categories
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,  // Users icon for user management
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,  // Settings icon remains the same
    },
  ]
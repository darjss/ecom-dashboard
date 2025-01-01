"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sideNavitems } from "@/lib/constants";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathName = usePathname().split("/")[1];
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sideNavitems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url.substring(1).toLowerCase() ===
                      pathName?.toLowerCase()
                    }
                    size={"lg"}
                  >
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <item.icon  width={20} height={20}/>
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

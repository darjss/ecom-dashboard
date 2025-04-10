"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sideNavItems } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const path=pathname.substring(pathname.indexOf("/"));
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4 pt-6">
              {sideNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url} className="flex items-center gap-4" >
                    <SidebarMenuButton   variant={path===item.url?"outline":"default"}   >
                      <item.icon className="size-5" />
                      <span className="text-base">{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

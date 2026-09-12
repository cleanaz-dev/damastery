import { Settings, Users, LayoutDashboard, Calendar, Box, Newspaper } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Schedule", url: "/admin/schedule", icon: Calendar },
  { title: "Products", url: "/admin/products", icon: Box },
  { title: "Blogs", url: "/admin/blogs", icon: Newspaper },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-none bg-primary text-primary-foreground"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 font-serif text-lg">
          <span className="h-6 w-6 shrink-0 rounded-sm bg-accent" />
          <span className="group-data-[collapsible=icon]:hidden">
            Damastery
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-foreground/60">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    tooltip={item.title}
                    className="hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
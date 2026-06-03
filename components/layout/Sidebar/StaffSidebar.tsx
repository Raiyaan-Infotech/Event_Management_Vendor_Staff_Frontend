"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase, Building2, Calendar, ChevronRight, CreditCard, Globe,
  Home, Images, Layers, List, Mail, Sliders, Star,
  LayoutDashboard, TrendingUp, BarChart3, Users, UserCog, ShieldCheck,
  User, Layers2, CalendarDays, Plus, ClipboardList, MessageCircle,
  BookUser, Receipt, DollarSign, Settings, SlidersHorizontal, Clock,
  HelpCircle, LucideIcon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useStaffMe } from "@/hooks/use-staff-auth";
import { resolveMediaUrl } from "@/lib/utils";
import { useVendorMe } from "@/hooks/use-vendors";
import Image from "next/image";



interface ChildItem { label: string; href: string; icon: LucideIcon; permission?: string; }
interface NavItem { label: string; href?: string; icon: LucideIcon; children?: ChildItem[]; permission?: string; hidden?: boolean; }

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    children: [
      { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, permission: "dashboard.view" },
    ],
  },
  { label: "Profile",       href: "/dashboard/profile",  icon: User },
  { label: "Client",        href: "/dashboard/clients",  icon: Users,        permission: "client.view" },
  { label: "Staff",         href: "/dashboard/staff",    icon: UserCog,      permission: "staff.view" },
  {
    label: "Communication",
    icon: Mail,
    permission: "communication.view",
    children: [
      { label: "Contact", href: "/dashboard/communication/contact", icon: BookUser,      permission: "communication.view" },
      { label: "Email",   href: "/dashboard/communication/email",   icon: Mail,          permission: "communication.view" },
      { label: "Chat",    href: "/dashboard/communication/chat",    icon: MessageCircle, permission: "communication.view" },
    ],
  },
  { label: "Reports",      href: "/dashboard/reports",          icon: BarChart3,  permission: "reports.view" },
  { label: "Transactions", href: "/dashboard/transactions",     icon: Receipt,    permission: "transactions.view" },
  {
    label: "Event",
    icon: CalendarDays,
    permission: "event.view",
    children: [
      { label: "Create an event", href: "/dashboard/events/create", icon: Plus, permission: "event.create" },
    ],
  },
  { label: "Payment", href: "/dashboard/payment-management", icon: DollarSign, permission: "payment.view" },
];

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) return true;
  if (!item.href && item.children?.length) {
    if (item.label === "Dashboard" && pathname === "/dashboard") return true;
  }
  return item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false;
}

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [mounted, setMounted] = React.useState(false);
  const { data: staff } = useStaffMe();
  const { data: vendor } = useVendorMe();

  const staffPermissions = React.useMemo(() => {
    return new Set(staff?.role?.permissions?.map((p) => p.slug) ?? []);
  }, [staff?.role?.permissions]);

  const filteredNavItems = React.useMemo(() => {
    if (!staff?.role) return NAV_ITEMS.filter((item) => item.label === "Dashboard");
    return NAV_ITEMS.filter((item) => !item.hidden).filter((item) => {
      if (!item.permission) return true;
      return staffPermissions.has(item.permission);
    }).map((item) => {
      if (!item.children) return item;
      const filteredChildren = item.children.filter((child) => {
        if (!child.permission) return true;
        return staffPermissions.has(child.permission);
      });
      return { ...item, children: filteredChildren };
    }).filter((item) => !item.children || item.children.length > 0);
  }, [staff?.role, staffPermissions]);

  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    filteredNavItems.forEach((item) => {
      if (item.children && isItemActive(item, pathname)) initial.add(item.label);
    });
    return initial;
  });

  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const toggleOpen = (label: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const activeClass   = "text-primary-foreground dark:text-white font-bold bg-primary dark:bg-primary drop-shadow-sm";
  const inactiveClass = "bg-transparent text-sidebar-foreground/70 dark:text-gray-400 hover:bg-sidebar-accent dark:hover:bg-white/10 hover:text-sidebar-accent-foreground dark:hover:text-white";
  const btnBase       = "h-[34px] rounded-sm transition-all duration-200 !outline-none !ring-0 focus-visible:ring-0 active:bg-transparent";

  return (
    <Sidebar collapsible="icon" className="border-none bg-sidebar" {...props}>
      <SidebarHeader
        className={`sticky top-0 z-50 min-h-[56px] border-none flex flex-col justify-center bg-sidebar/95 backdrop-blur-sm transition-all duration-300 ${
          isCollapsed ? "px-1.5 py-3" : "pl-3 pr-4 py-3"
        }`}
      >
        <Link
          href="/dashboard"
          className={`flex items-center no-underline relative w-full overflow-hidden ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
        >
          <div
            className={`h-9 w-9 shrink-0 rounded-sm shadow-[0_4px_12px_rgba(52,84,209,0.3)] transition-all duration-300 flex items-center justify-center bg-primary overflow-hidden relative
              ${isCollapsed ? "opacity-100 scale-100 translate-x-0 rotate-0" : "opacity-0 scale-50 -translate-x-10 -rotate-12 absolute"}`}
          >
            {vendor?.company_logo ? (
              <Image src={resolveMediaUrl(vendor.company_logo)} alt="Company Logo" fill priority className="object-contain" />
            ) : (
              <span className="text-[15px] font-extrabold text-primary-foreground leading-none">
                {vendor?.company_name ? vendor.company_name.charAt(0).toUpperCase() : "V"}
              </span>
            )}
          </div>
          <div
            className={`flex flex-col transition-all duration-300 justify-center items-center
              ${!isCollapsed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 absolute pointer-events-none"}`}
          >
            {vendor?.company_logo ? (
              <div className="relative h-9 w-32">
                <Image src={resolveMediaUrl(vendor.company_logo)} alt="Company Logo" fill priority className="object-contain" />
              </div>
            ) : (
              <span className="text-[19px] font-extrabold tracking-tight text-sidebar-foreground dark:text-gray-100 leading-none">
                {vendor?.company_name ?? "Vendor Portal"}
              </span>
            )}
            {vendor?.company_name && (
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground dark:text-gray-400 m-0 p-0 mt-1 truncate max-w-[140px]">
                {vendor.company_name}
              </p>
            )}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className={`py-4 bg-sidebar transition-all duration-300 ${isCollapsed ? "px-1" : "px-4"}`}>
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            {filteredNavItems.map((item) => {
              const active      = isItemActive(item, pathname);
              const hasChildren = !!item.children?.length;
              const isOpen      = openItems.has(item.label);
              const Icon        = item.icon;

              if (!hasChildren) {
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      className={`${btnBase} ${active ? activeClass : inactiveClass} ${isCollapsed ? "px-0 justify-center" : "px-3.5"}`}
                    >
                      <Link href={item.href!} className="flex items-center gap-2.5 w-full">
                        <div className={`flex items-center justify-center ${isCollapsed ? "w-full px-1" : "gap-0.5"}`}>
                          <Icon className={`size-[14px] transition-colors ${active ? "text-primary-foreground dark:text-white" : "text-sidebar-foreground/70 dark:text-gray-400"}`} />
                        </div>
                        <span className="text-[12px] font-semibold group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible key={item.label} open={isOpen} onOpenChange={() => toggleOpen(item.label)}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={item.label}
                      onClick={() => { if (item.href) router.push(item.href); toggleOpen(item.label); }}
                      className={`${btnBase} ${active ? activeClass : inactiveClass} ${isCollapsed ? "px-0 justify-center" : "px-3.5"}`}
                    >
                      <div className={`flex items-center justify-center ${isCollapsed ? "w-full px-1" : "gap-0.5"}`}>
                        <Icon className={`size-[14px] transition-colors ${active ? "text-primary-foreground dark:text-white" : "text-sidebar-foreground/70 dark:text-gray-400"}`} />
                      </div>
                      <span className="text-[12px] font-semibold group-data-[collapsible=icon]:hidden flex-1 text-left">{item.label}</span>
                      <ChevronRight className={`w-3 h-3 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${isOpen ? "rotate-90" : ""} ${active ? "text-primary-foreground/70 dark:text-white/70" : "text-sidebar-foreground/30"}`} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <div className="mt-0.5 flex flex-col gap-1">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                        const ChildIcon   = child.icon;
                        return (
                          <SidebarMenuItem key={child.label}>
                            <SidebarMenuButton asChild tooltip={child.label} className={`${btnBase} ${childActive ? activeClass : inactiveClass} ${isCollapsed ? "px-0 justify-center" : "px-3.5 pl-8"}`}>
                              <Link href={child.href} className="flex items-center gap-2.5 w-full">
                                <div className={`flex items-center justify-center ${isCollapsed ? "w-full px-1" : "gap-0.5"}`}>
                                  <ChildIcon className={`size-[14px] transition-colors ${childActive ? "text-primary-foreground dark:text-white" : "text-sidebar-foreground/70 dark:text-gray-400"}`} />
                                </div>
                                <span className="text-[12px] font-semibold group-data-[collapsible=icon]:hidden">{child.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

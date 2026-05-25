import {
  LayoutDashboard,
  Users,
  Kanban,
  MessageCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Chat Center", href: "/chat", icon: MessageCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

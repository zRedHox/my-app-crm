import type { UserOut } from "@/lib/api/users";

export function getUserInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export function getUserRoleLabel(user: UserOut): string {
  if (user.tag?.trim()) return user.tag.trim();
  if (user.role_id === 1) return "Admin";
  return "User";
}

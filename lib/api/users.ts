import { apiClient } from "./client";

export interface UserOut {
  id: number;
  name: string;
  email: string;
  role_id: number;
  tag?: string | null;
}

export async function getMe(): Promise<UserOut> {
  return apiClient<UserOut>("/api/v1/me");
}

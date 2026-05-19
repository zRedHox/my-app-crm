import { API_BASE_URL } from "./config";
import { setAccessToken } from "@/lib/auth/token";
import { ApiError } from "./client";
import type { LoginResponse } from "./types";

export async function login(username: string, password: string): Promise<void> {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const res = await fetch(`${API_BASE_URL}/api/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  let data: LoginResponse & { detail?: string } | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      /* ignore */
    }
  }

  if (!res.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : res.statusText || "Login failed";
    throw new ApiError(message, res.status, data);
  }

  if (!data?.access_token) {
    throw new ApiError("No access token returned", res.status, data);
  }

  setAccessToken(data.access_token);
}

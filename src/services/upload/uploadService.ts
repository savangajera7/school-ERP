import { Platform } from "react-native";
import axiosInstance from "@/services/api/axiosInstance";
import { API_BASE_URL } from "@/constants/api";
import type { ApiResult } from "@/types/auth.types";

export type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

/** Resolve relative upload paths from API */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const base = API_BASE_URL.replace(/\/$/, "");
  
  // If it's just a filename (no slash), assume it's in the default StudentImg folder
  if (!trimmed.includes("/") && !trimmed.includes("\\")) {
    return `${base}/Uploads/StudentImg/${trimmed}`;
  }

  const rel = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${rel}`;
}

function extractUploadPath(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const candidates = [o.data, o.path, o.url, o.filePath, o.fileName, o.imagePath];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
    }
    if (o.data && typeof o.data === "object") {
      return extractUploadPath(o.data);
    }
  }
  return null;
}

export async function uploadProfileImage(image: PickedImage): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const res = await fetch(image.uri);
    const blob = await res.blob();
    formData.append("image", blob, image.name);
  } else {
    formData.append("image", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  }

  const response = await axiosInstance.post<ApiResult<unknown>>(
    "/api/Uploded/UploadImage",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (data) => data,
    }
  );

  const envelope = response.data;
  if (!envelope?.success) {
    throw new Error(envelope?.message || "Image upload failed");
  }

  const raw =
    extractUploadPath(envelope.data) ??
    extractUploadPath(envelope) ??
    (typeof envelope.message === "string" && envelope.message.includes("/")
      ? envelope.message
      : null);

  const url = resolveMediaUrl(raw);
  if (!url) throw new Error("Upload succeeded but no image URL was returned");
  return url;
}

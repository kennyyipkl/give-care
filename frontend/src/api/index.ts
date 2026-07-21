import api from "./client";
import type { TokenResponse } from "../types";

export interface EventCreateData {
  title: string;
  date: string;
  description: string;
  donation_purpose: string;
  status: string;
}

export interface StoryGenerateData {
  event_title: string;
  event_description: string;
  photo_title: string;
  donation_purpose: string;
}

export interface DonateData {
  amount: number;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name: string;
}

export const authApi = {
  register: (data: RegisterData) => api.post<TokenResponse>("/auth/register", data),
  login: (data: LoginData) => api.post<TokenResponse>("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const eventApi = {
  list: () => api.get("/events"),
  get: (id: number) => api.get(`/events/${id}`),
  create: (data: EventCreateData) => api.post("/events", data),
  update: (id: number, data: Partial<EventCreateData>) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

export const photoApi = {
  list: (eventId?: number, includeRemoved?: boolean) => {
    const params: Record<string, string> = {};
    if (eventId !== undefined) params.event_id = String(eventId);
    if (includeRemoved) params.include_removed = "true";
    return api.get("/photos", { params });
  },
  gallery: (search?: string) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    return api.get("/photos/all/gallery", { params });
  },
  get: (id: number) => api.get(`/photos/${id}`),
  create: (formData: FormData) =>
    api.post("/photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  /** Upload a photo using base64 (works in production where there's no filesystem). */
  createBase64: (data: { event_id: number; title: string; uploaded_by: string; story: string; image_data: string }) => {
    const formData = new FormData();
    formData.append("event_id", String(data.event_id));
    formData.append("title", data.title);
    formData.append("uploaded_by", data.uploaded_by);
    formData.append("story", data.story);
    formData.append("image_data", data.image_data);
    return photoApi.create(formData);
  },
  generateStory: (data: StoryGenerateData) => api.post("/photos/generate-story", data),
  share: (id: number) => api.post(`/photos/${id}/share`),
  donate: (id: number, data: DonateData) => api.post(`/photos/${id}/donate`, data),
  remove: (id: number) => api.put(`/photos/${id}/remove`),
  restore: (id: number) => api.put(`/photos/${id}/restore`),
};

export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

export default api;
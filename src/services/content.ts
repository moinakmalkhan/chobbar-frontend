import { api } from "@/lib/api";
import type { FAQ, Page, Storefront } from "@/types/api";

export const contentService = {
  storefront: () => api.get<Storefront>("/content/storefront/").then((r) => r.data),
  page: (slug: string) => api.get<Page>(`/content/pages/${slug}/`).then((r) => r.data),
  faq: () => api.get<FAQ[]>("/content/faq/").then((r) => r.data),
};

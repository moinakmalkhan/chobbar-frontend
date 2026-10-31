export const env = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, ""),
  wsUrl: (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws").replace(/\/$/, ""),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
} as const;

export const SITE = {
  name: "Leepa Sports",
  tagline: "Wholesale teamwear, made in Sialkot",
  supportEmail: "sales@leepasports.com",
  phone: "+92 52 000 0000",
  address: "Sialkot, Punjab, Pakistan",
} as const;

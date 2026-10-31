import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Open a wholesale account" };

export default function RegisterPage() {
  return <RegisterForm />;
}

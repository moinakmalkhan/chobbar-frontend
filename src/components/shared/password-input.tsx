"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        dir="ltr"
        className="pe-12 rtl:text-right"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute end-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});

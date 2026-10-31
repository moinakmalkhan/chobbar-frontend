"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-x flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-display text-2xl font-extrabold">{t("errors.generic")}</h1>
      <p className="text-muted-foreground mt-2">{t("errors.tryAgain")}</p>
      {error.digest ? <p className="text-muted-foreground mt-2 font-mono text-xs">{error.digest}</p> : null}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>
          <RotateCcw />
          {t("common.retry")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t("errors.goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}

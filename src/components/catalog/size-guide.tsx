"use client";

import { Ruler } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/client";

export function SizeGuide({ guide, groupName }: { guide: Record<string, string>[]; groupName: string }) {
  const { t } = useI18n();
  if (!guide.length) return null;
  const columns = Object.keys(guide[0]);
  const label = (c: string) => {
    const key = `product.guide.${c}` as const;
    const v = t(key as Parameters<typeof t>[0]);
    return v === key ? c : v;
  };
  return (
    <Dialog>
      <DialogTrigger className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
        <Ruler className="size-4" />
        {t("product.sizeGuide")}
      </DialogTrigger>
      <DialogContent closeLabel={t("common.close")}>
        <DialogHeader>
          <DialogTitle>{t("product.sizeGuide")}</DialogTitle>
          <DialogDescription>
            {groupName} · {t("product.guideUnits")}
          </DialogDescription>
        </DialogHeader>
        <div className="border-border overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-2.5 text-start font-semibold">
                    {label(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.map((row, i) => (
                <tr key={i} className="border-border border-t">
                  {columns.map((c) => (
                    <td key={c} className="px-4 py-2.5 tabular-nums" dir={c === "size" ? "ltr" : undefined}>
                      {row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-xs">{t("product.guideTip")}</p>
      </DialogContent>
    </Dialog>
  );
}

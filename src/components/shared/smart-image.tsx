"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { LogoMark } from "@/components/layout/logo";
import { cn, mediaUrl } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
  wrapperClassName?: string;
};

/** next/image with a soft fade-in, a shimmer while loading and a branded fallback when the file is missing. */
export function SmartImage({ src, alt, className, wrapperClassName, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);
  return (
    <div
      className={cn(
        "bg-muted relative overflow-hidden",
        !loaded && !failed && url && "shimmer",
        wrapperClassName,
      )}
    >
      {url && !failed ? (
        <Image
          src={url}
          alt={alt}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          {...props}
        />
      ) : (
        <div className="from-muted to-surface absolute inset-0 grid place-items-center bg-gradient-to-br">
          <LogoMark className="h-1/4 max-h-16 opacity-25" title={alt} />
        </div>
      )}
    </div>
  );
}

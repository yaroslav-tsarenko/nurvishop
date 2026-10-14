"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";

type ProductImageProps = Omit<ImageProps, "src" | "unoptimized" | "onError"> & {
  src: string;
  /** Rendered when even the direct supplier URL fails to load. */
  fallback?: React.ReactNode;
};

/**
 * next/image for supplier-hosted product photos. If the optimized request
 * fails (Vercel Image Optimization quota exhausted, supplier blocking the
 * optimizer's data-center IPs, cold-start timeout…) it retries once with the
 * original URL straight from the supplier CDN instead of leaving an empty
 * card.
 */
export function ProductImage({ src, fallback = null, alt, ...props }: ProductImageProps) {
  // Track which src the state belongs to so a new src starts optimized again.
  const [state, setState] = useState({ src, direct: shouldUnoptimizeImage(src), failed: false });
  const current = state.src === src ? state : { src, direct: shouldUnoptimizeImage(src), failed: false };

  if (current.failed) return <>{fallback}</>;

  return (
    <Image
      key={`${src}|${current.direct ? "direct" : "optimized"}`}
      {...props}
      src={src}
      alt={alt}
      unoptimized={current.direct}
      onError={() =>
        setState(current.direct ? { ...current, failed: true } : { ...current, direct: true })
      }
    />
  );
}

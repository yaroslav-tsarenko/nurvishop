"use client";

import { useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

const mainImageClass =
  "relative aspect-square cursor-zoom-in overflow-hidden rounded-lg border border-line bg-surface p-2 sm:aspect-[4/3] sm:rounded-xl sm:p-4";

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className={clsx(mainImageClass, "flex items-center justify-center text-subtle")}>
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={mainImageClass}>
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "contain" }}
          priority
          unoptimized={shouldUnoptimizeImage(images[selectedIndex].url)}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={clsx(
                "relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-well transition-[border-color,transform] duration-200 hover:scale-105 hover:border-line-hover sm:h-[72px] sm:w-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                index === selectedIndex ? "border-accent" : "border-transparent",
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                sizes="64px"
                style={{ objectFit: "contain" }}
                unoptimized={shouldUnoptimizeImage(image.url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImage} style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)" }}>
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
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
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`${styles.thumbnail} ${index === selectedIndex ? styles.thumbnailActive : ""}`}
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

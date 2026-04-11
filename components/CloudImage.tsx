"use client";

import { CldImage } from "next-cloudinary";

interface CloudImageProps {
  src: string; // Cloudinary public ID, e.g. "ova/hero"
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function CloudImage({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  className = "",
  sizes,
}: CloudImageProps) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width={fill ? undefined : (width || 1200)}
      height={fill ? undefined : (height || 800)}
      fill={fill}
      priority={priority}
      className={className}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      format="auto"
      quality="auto"
    />
  );
}

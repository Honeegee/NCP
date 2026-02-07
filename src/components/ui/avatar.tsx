"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = "", src, width, height, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    if (hasError || !src) return null;

    // Use Next.js Image for string URLs, fall back to img for Blob/File objects
    if (typeof src === "string") {
      return (
        <Image
          ref={ref}
          alt={alt}
          src={src}
          className={cn("aspect-square h-full w-full object-cover", className)}
          onError={() => setHasError(true)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
      );
    }

    // Fall back to regular img for Blob/File objects
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        alt={alt}
        src={URL.createObjectURL(src)}
        className={cn("aspect-square h-full w-full object-cover", className)}
        onError={() => setHasError(true)}
        width={width}
        height={height}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };

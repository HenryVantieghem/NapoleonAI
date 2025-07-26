"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  sizes,
  fill = false,
  style,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Default blur data URL for placeholder
  const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  // Fallback for broken images
  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-gray-100 flex items-center justify-center",
          className
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height, ...style }}
      >
        <div className="text-center p-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2" />
          <span className="text-xs text-gray-400">Image unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", fill && "w-full h-full")}>
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-100 animate-pulse rounded-lg",
            className
          )}
          style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0",
          className
        )}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        fill={fill}
        style={{
          objectFit: objectFit,
          ...style
        }}
      />
    </div>
  )
}

// Specialized component for executive avatars
export function ExecutiveAvatar({
  src,
  name,
  size = "md",
  className,
  showCrown = false,
}: {
  src: string
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
  showCrown?: boolean
}) {
  const sizes = {
    sm: { width: 32, height: 32, crown: 12 },
    md: { width: 48, height: 48, crown: 16 },
    lg: { width: 64, height: 64, crown: 20 },
  }

  const { width, height, crown } = sizes[size]

  return (
    <div className={cn("relative", className)}>
      <OptimizedImage
        src={src}
        alt={`${name} avatar`}
        width={width}
        height={height}
        className="rounded-full"
        quality={90}
      />
      {showCrown && (
        <div 
          className="absolute -bottom-1 -right-1 bg-burgundy-600 rounded-full flex items-center justify-center"
          style={{ width: crown, height: crown }}
        >
          <svg 
            className="text-white" 
            style={{ width: crown * 0.6, height: crown * 0.6 }}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 2l2.5 5 5.5 1-4 4 1 5.5L10 15l-5 2.5 1-5.5-4-4 5.5-1z"/>
          </svg>
        </div>
      )}
    </div>
  )
}
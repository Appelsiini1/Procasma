import { useState, useEffect } from "react";

interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function FadeInImage({ src, alt, className }: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${isLoaded ? "visible" : "hidden"}`}
    />
  );
}

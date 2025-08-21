import { useState, useEffect } from 'react';

// Hook for preloading images
export function useImagePreloader(images: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        const loaded = await Promise.allSettled(promises);
        const successfullyLoaded = loaded
          .filter((result) => result.status === 'fulfilled')
          .map((result) => (result as PromiseFulfilledResult<string>).value);

        setLoadedImages(new Set(successfullyLoaded));
      } catch (error) {
        console.error('Error preloading images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (images.length > 0) {
      preloadImages();
    } else {
      setIsLoading(false);
    }
  }, [images]);

  return { loadedImages, isLoading, isImageLoaded: (src: string) => loadedImages.has(src) };
}

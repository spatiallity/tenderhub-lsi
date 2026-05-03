import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage Component - Lazy loading images with intersection observer
 * Only loads images when they enter the viewport
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.placeholder - Placeholder image (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onLoad - Callback when image loads
 * @param {Function} props.onError - Callback when image fails to load
 * 
 * @example
 * <LazyImage 
 *   src="/images/tender-photo.jpg" 
 *   alt="Tender location"
 *   placeholder="/images/placeholder.jpg"
 *   className="w-full h-48 object-cover"
 * />
 */
const LazyImage = ({
  src,
  alt = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    if (!imgRef.current) return;
    
    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load image when it enters viewport
            const img = new Image();
            
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              onLoad?.();
            };
            
            img.onerror = () => {
              setIsError(true);
              onError?.();
            };
            
            img.src = src;
            
            // Stop observing after loading
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, onLoad, onError]);
  
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${isError ? 'bg-slate-200' : ''} ${className}`}
      loading="lazy"
      {...props}
    />
  );
};

/**
 * LazyBackgroundImage Component - Lazy loading background images
 * 
 * @example
 * <LazyBackgroundImage 
 *   src="/images/hero-bg.jpg"
 *   className="h-64 bg-cover bg-center"
 * >
 *   <div>Content here</div>
 * </LazyBackgroundImage>
 */
export const LazyBackgroundImage = ({
  src,
  placeholder = 'linear-gradient(to bottom, #f1f5f9, #e2e8f0)',
  className = '',
  children,
  ...props
}) => {
  const [backgroundImage, setBackgroundImage] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const divRef = useRef(null);
  
  useEffect(() => {
    if (!divRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            
            img.onload = () => {
              setBackgroundImage(`url(${src})`);
              setIsLoaded(true);
            };
            
            img.src = src;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );
    
    observer.observe(divRef.current);
    
    return () => {
      if (divRef.current) {
        observer.unobserve(divRef.current);
      }
    };
  }, [src]);
  
  return (
    <div
      ref={divRef}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${className}`}
      style={{ backgroundImage }}
      {...props}
    >
      {children}
    </div>
  );
};

export default LazyImage;

import React, { useEffect, useCallback, useRef } from 'react';

// Hook para otimização de performance
export function usePerformance() {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>();

  useEffect(() => {
    renderCountRef.current += 1;
    if (!mountTimeRef.current) {
      mountTimeRef.current = performance.now();
    }
  });

  const logPerformance = useCallback((componentName: string) => {
    const mountTime = mountTimeRef.current;
    const renderCount = renderCountRef.current;
    const currentTime = performance.now();
    
    console.log(`Performance [${componentName}]:`, {
      renderCount,
      timeSinceMount: mountTime ? currentTime - mountTime : 0,
      timestamp: currentTime
    });
  }, []);

  return { logPerformance, renderCount: renderCountRef.current };
}

// Hook para debounce otimizado
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle otimizado
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledRef = useRef<T>();
  const lastCallTimeRef = useRef<number>(0);

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = performance.now();
      
      if (now - lastCallTimeRef.current >= delay) {
        lastCallTimeRef.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  throttledRef.current = throttledFunction;
  return throttledRef.current;
}

// Hook para intersection observer (lazy loading)
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

// Hook para prefetch de recursos
export function usePrefetch() {
  const prefetchedResources = useRef(new Set<string>());

  const prefetch = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (prefetchedResources.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = type;
    
    document.head.appendChild(link);
    prefetchedResources.current.add(url);
  }, []);

  const preload = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (prefetchedResources.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    
    document.head.appendChild(link);
    prefetchedResources.current.add(url);
  }, []);

  return { prefetch, preload };
}

// Hook para lazy loading de componentes
export function useLazyLoad<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    importFunction()
      .then(module => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [importFunction]);

  const LazyComponent = React.useMemo(() => {
    if (loading) {
      return fallback || (() => React.createElement('div', null, 'Carregando...'));
    }
    
    if (error || !Component) {
      return () => React.createElement('div', null, 'Erro ao carregar componente');
    }
    
    return Component;
  }, [Component, loading, error, fallback]);

  return { Component: LazyComponent, loading, error };
}

// Hook para otimização de imagens
export function useImageOptimization() {
  const [supportsWebP, setSupportsWebP] = React.useState<boolean | null>(null);
  const [supportsAVIF, setSupportsAVIF] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Verificar suporte a WebP
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;
    const webpSupport = webpCanvas.toDataURL('image/webp').indexOf('webp') > -1;
    setSupportsWebP(webpSupport);

    // Verificar suporte a AVIF
    const avifImage = new Image();
    avifImage.onload = () => setSupportsAVIF(true);
    avifImage.onerror = () => setSupportsAVIF(false);
    avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }, []);

  const getOptimizedImageUrl = useCallback((
    originalUrl: string,
    width?: number,
    quality: number = 85
  ) => {
    const url = new URL(originalUrl, window.location.origin);
    
    if (width) {
      url.searchParams.set('w', width.toString());
    }
    
    url.searchParams.set('q', quality.toString());
    
    if (supportsAVIF) {
      url.searchParams.set('format', 'avif');
    } else if (supportsWebP) {
      url.searchParams.set('format', 'webp');
    }
    
    return url.toString();
  }, [supportsWebP, supportsAVIF]);

  return { getOptimizedImageUrl, supportsWebP, supportsAVIF };
}


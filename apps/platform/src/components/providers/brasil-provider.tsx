'use client';

import React from 'react';
import { ToastProvider } from '@/components/ui/toast-brasil';
import ErrorBoundary from '@/components/ui/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';

interface BrasilProviderProps {
  children: React.ReactNode;
}

export function BrasilProvider({ children }: BrasilProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      <ErrorBoundary>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Context para configurações globais da UI brasileira
interface BrasilUIConfig {
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  soundEffects: boolean;
}

interface BrasilUIContextType {
  config: BrasilUIConfig;
  updateConfig: (updates: Partial<BrasilUIConfig>) => void;
  playSound: (soundName: string) => void;
}

const BrasilUIContext = React.createContext<BrasilUIContextType | null>(null);

export function BrasilUIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<BrasilUIConfig>({
    animations: true,
    reducedMotion: false,
    highContrast: false,
    soundEffects: false,
  });

  // Detectar preferências do sistema
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setConfig(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateConfig = React.useCallback((updates: Partial<BrasilUIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const playSound = React.useCallback((soundName: string) => {
    if (!config.soundEffects) return;
    
    // Implementar sons de feedback (opcional)
    const sounds = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      click: '/sounds/click.mp3',
      notification: '/sounds/notification.mp3',
    };

    const soundFile = sounds[soundName as keyof typeof sounds];
    if (soundFile) {
      const audio = new Audio(soundFile);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors - sound is optional
      });
    }
  }, [config.soundEffects]);

  const value = React.useMemo(() => ({
    config,
    updateConfig,
    playSound,
  }), [config, updateConfig, playSound]);

  return (
    <BrasilUIContext.Provider value={value}>
      {children}
    </BrasilUIContext.Provider>
  );
}

export function useBrasilUI() {
  const context = React.useContext(BrasilUIContext);
  if (!context) {
    throw new Error('useBrasilUI must be used within BrasilUIProvider');
  }
  return context;
}

// Hook para animações responsivas
export function useResponsiveAnimations() {
  const { config } = useBrasilUI();
  
  return {
    shouldAnimate: config.animations && !config.reducedMotion,
    getAnimationClass: (animationClass: string) => 
      config.animations && !config.reducedMotion ? animationClass : '',
    getTransition: (duration: string = '0.3s') =>
      config.animations && !config.reducedMotion ? `all ${duration} ease` : 'none',
  };
}

// Hook para feedback de interação
export function useInteractionFeedback() {
  const { playSound } = useBrasilUI();
  
  return {
    onSuccess: () => playSound('success'),
    onError: () => playSound('error'),
    onClick: () => playSound('click'),
    onNotification: () => playSound('notification'),
  };
}

// Performance Monitoring Component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS:', entry);
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      return () => observer.disconnect();
    }
  }, []);

  return <>{children}</>;
}
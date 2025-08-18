import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingStep {
  id: string;
  message: string;
  icon?: string;
  duration?: number;
}

interface LoadingProgressProps {
  steps: LoadingStep[];
  currentStep: number;
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export function LoadingProgress({
  steps,
  currentStep,
  progress,
  className,
  showPercentage = true,
  animated = true,
}: LoadingProgressProps) {
  const currentStepData = steps[currentStep] || steps[steps.length - 1];

  return (
    <div className={cn("flex flex-col items-center space-y-6 p-8", className)}>
      {/* Logo/Icon Area */}
      <div className="relative">
        <div className="w-16 h-16 bg-ouro-gradient rounded-full flex items-center justify-center animate-pulse-gold">
          <span className="text-brasil-navy text-2xl font-bold">🇧🇷</span>
        </div>
        {animated && (
          <div className="absolute inset-0 w-16 h-16 border-4 border-brasil-gold/30 rounded-full animate-spin" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <div className="progress-brasil">
          <div 
            className="progress-brasil-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        {showPercentage && (
          <div className="text-center text-brasil-gold font-semibold">
            {Math.round(progress)}%
          </div>
        )}
      </div>

      {/* Current Step */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-brasil-pearl">
          {currentStepData?.icon && (
            <span className="text-xl">{currentStepData.icon}</span>
          )}
          <span className="text-lg font-medium">
            {currentStepData?.message || "Carregando..."}
          </span>
        </div>
        
        {/* Animated Dots */}
        <div className="loading-dots flex justify-center gap-1">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Steps Preview */}
      <div className="flex justify-center gap-2 mt-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index <= currentStep
                ? "bg-brasil-gold"
                : "bg-brasil-royal border border-brasil-gold/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Hook para gerenciar o loading progressivo
export function useLoadingProgress(steps: LoadingStep[]) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  const nextStep = React.useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      if (next === steps.length - 1) {
        setIsComplete(true);
      }
      return next;
    });
  }, [steps.length]);

  const updateProgress = React.useCallback((newProgress: number) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100));
  }, []);

  const reset = React.useCallback(() => {
    setCurrentStep(0);
    setProgress(0);
    setIsComplete(false);
  }, []);

  return {
    currentStep,
    progress,
    isComplete,
    nextStep,
    updateProgress,
    reset,
  };
}

// Componente de Skeleton Loader Premium
interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
  variant?: "text" | "card" | "button" | "avatar" | "custom";
}

export function Skeleton({
  className,
  lines = 1,
  width,
  height,
  variant = "text",
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full";
      case "card":
        return "h-32 w-full rounded-xl";
      case "button":
        return "h-10 w-24 rounded-lg";
      case "avatar":
        return "h-12 w-12 rounded-full";
      default:
        return "";
    }
  };

  const skeletonStyle = {
    width,
    height,
  };

  if (lines === 1) {
    return (
      <div
        className={cn("skeleton", getVariantClasses(), className)}
        style={skeletonStyle}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "skeleton",
            getVariantClasses(),
            index === lines - 1 && "w-3/4" // Last line shorter
          )}
          style={skeletonStyle}
        />
      ))}
    </div>
  );
}

// Skeleton para Cards específicos
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("card-brasil p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton lines={3} />
      <div className="flex justify-between items-center">
        <Skeleton variant="button" />
        <Skeleton variant="text" width="80px" />
      </div>
    </div>
  );
}

// Skeleton para Dashboard
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="button" />
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-brasil p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width="100px" />
              <Skeleton variant="avatar" className="w-8 h-8" />
            </div>
            <Skeleton variant="text" width="60px" height="24px" />
            <Skeleton variant="text" width="80%" />
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
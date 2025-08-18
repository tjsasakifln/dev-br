import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastMessages = {
  success: {
    prefix: "🎉",
    suffix: "Que top!",
  },
  error: {
    prefix: "😅",
    suffix: "Vamos resolver juntos!",
  },
  warning: {
    prefix: "⚠️",
    suffix: "Opa, algo precisa de atenção...",
  },
  info: {
    prefix: "💡",
    suffix: "Dica valiosa!",
  },
};

export function ToastBrasil({ toast, onDismiss }: ToastProps) {
  const Icon = toastIcons[toast.type];
  const message = toastMessages[toast.type];
  
  React.useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 animate-slide-up",
        "min-w-[300px] max-w-[500px] relative overflow-hidden",
        {
          "toast-success": toast.type === "success",
          "toast-warning": toast.type === "warning", 
          "toast-error": toast.type === "error",
          "bg-brasil-royal border-l-brasil-gold text-brasil-pearl": toast.type === "info",
        }
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="font-semibold flex items-center gap-2">
          <span>{message.prefix}</span>
          <span>{toast.title}</span>
        </div>
        {toast.description && (
          <div className="text-sm opacity-90">
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline hover:no-underline mt-2 block"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {toast.dismissible !== false && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Progress Bar (for timed toasts) */}
      {toast.duration && toast.duration > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-pulse"
          style={{
            animation: `shrink ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = "top-right" 
}: ToastContainerProps) {
  const positionClasses = {
    "top-right": "fixed top-4 right-4 z-50",
    "top-left": "fixed top-4 left-4 z-50",
    "bottom-right": "fixed bottom-4 right-4 z-50",
    "bottom-left": "fixed bottom-4 left-4 z-50",
    "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
    "bottom-center": "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
  };

  if (toasts.length === 0) return null;

  return (
    <div className={cn(positionClasses[position], "space-y-2")}>
      {toasts.map((toast) => (
        <ToastBrasil
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook para gerenciar toasts
export function useToastBrasil() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((
    title: string,
    type: Toast["type"],
    options?: Partial<Omit<Toast, "id" | "title" | "type">>
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      title,
      type,
      duration: 5000,
      dismissible: true,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = React.useCallback((title: string, options?: Partial<Omit<Toast, "id" | "title" | "type">>) => {
    return showToast(title, "success", options);
  }, [showToast]);

  const error = React.useCallback((title: string, options?: Partial<Omit<Toast, "id" | "title" | "type">>) => {
    return showToast(title, "error", options);
  }, [showToast]);

  const warning = React.useCallback((title: string, options?: Partial<Omit<Toast, "id" | "title" | "type">>) => {
    return showToast(title, "warning", options);
  }, [showToast]);

  const info = React.useCallback((title: string, options?: Partial<Omit<Toast, "id" | "title" | "type">>) => {
    return showToast(title, "info", options);
  }, [showToast]);

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    success,
    error,
    warning,
    info,
  };
}

// Context Provider para toasts globais
const ToastContext = React.createContext<ReturnType<typeof useToastBrasil> | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastMethods = useToastBrasil();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer
        toasts={toastMethods.toasts}
        onDismiss={toastMethods.dismissToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
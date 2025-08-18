import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full min-w-0 border bg-transparent text-base shadow-xs transition-all duration-300 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-brasil",
  {
    variants: {
      variant: {
        default: "border-brasil-gold/30 bg-brasil-royal/50 text-brasil-pearl placeholder:text-brasil-pearl/50 hover:border-brasil-gold/50 focus:border-brasil-gold focus:bg-brasil-royal/70",
        outline: "border-brasil-gold/30 bg-transparent text-brasil-pearl placeholder:text-brasil-pearl/60 hover:border-brasil-gold/50 focus:border-brasil-gold",
        filled: "border-transparent bg-brasil-royal text-brasil-pearl placeholder:text-brasil-pearl/60 hover:bg-brasil-royal/80 focus:bg-brasil-royal focus:border-brasil-gold",
        glass: "border-brasil-gold/20 glass-brasil text-brasil-pearl placeholder:text-brasil-pearl/60 hover:border-brasil-gold/40 focus:border-brasil-gold",
      },
      size: {
        sm: "h-8 px-3 py-1 rounded-md text-sm",
        default: "h-10 px-4 py-2 rounded-lg",
        lg: "h-12 px-6 py-3 rounded-lg text-base",
      },
      status: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        success: "border-brasil-jade focus:border-brasil-jade focus:ring-brasil-jade/20",
        warning: "border-brasil-amber focus:border-brasil-amber focus:ring-brasil-amber/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      status: "default",
    },
  },
);

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, status, type, leftIcon, rightIcon, clearable, onClear, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const hasValue = props.value || props.defaultValue;

    const togglePassword = () => setShowPassword(!showPassword);

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    if (leftIcon || rightIcon || isPassword || clearable) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brasil-pearl/60">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            data-slot="input"
            className={cn(
              inputVariants({ variant, size, status }),
              leftIcon && "pl-10",
              (rightIcon || isPassword || (clearable && hasValue)) && "pr-10",
              className,
            )}
            ref={ref}
            {...props}
          />

          {(rightIcon || isPassword || (clearable && hasValue)) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {clearable && hasValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-brasil-pearl/60 hover:text-brasil-pearl transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {isPassword && (
                <button
                  type="button"
                  onClick={togglePassword}
                  className="text-brasil-pearl/60 hover:text-brasil-pearl transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              
              {rightIcon && !isPassword && (
                <div className="text-brasil-pearl/60">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={inputType}
        data-slot="input"
        className={cn(inputVariants({ variant, size, status }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// SearchInput Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void;
  placeholder?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, placeholder = "Buscar...", ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (onSearch) {
        onSearch(newValue);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        leftIcon={<Search className="h-4 w-4" />}
        placeholder={placeholder}
        clearable
        onClear={() => {
          setValue("");
          if (onSearch) onSearch("");
        }}
        {...props}
        value={value}
        onChange={handleChange}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

// TextArea Component with Brazilian design
interface TextAreaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof inputVariants> {
  resize?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant, size, status, resize = true, ...props }, ref) => {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          inputVariants({ variant, size, status }),
          "min-h-[80px] py-2",
          !resize && "resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

export { Input, SearchInput, TextArea, inputVariants };
export type { InputProps, SearchInputProps, TextAreaProps };

// Configurable metadata types and utilities
export interface ConfigurableFieldUIMetadata {
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

export interface ConfigurableMetadata {
  [fieldName: string]: ConfigurableFieldUIMetadata;
}
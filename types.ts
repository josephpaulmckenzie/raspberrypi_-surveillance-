
export function valueNotNull(value: string | null): value is string {
    return value !== null;
  }
  
export type StringOrNull = string | null | undefined;

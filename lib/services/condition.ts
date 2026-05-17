export interface ConditionOptions {
  expression: string;
  data: Record<string, unknown>;
}

export interface ConditionResult {
  success: boolean;
  result: boolean;
  error?: string;
}

export function evaluateCondition(options: ConditionOptions): ConditionResult {
  try {
    const func = new Function("data", `return ${options.expression}`);
    const result = func(options.data);
    return { success: true, result: !!result };
  } catch (error) {
    return {
      success: false,
      result: false,
      error: error instanceof Error ? error.message : "Invalid expression",
    };
  }
}

export function simpleCondition(
  value: unknown,
  operator: "equals" | "not_equals" | "contains" | "gt" | "lt" | "gte" | "lte",
  expected: unknown
): boolean {
  switch (operator) {
    case "equals": return value === expected;
    case "not_equals": return value !== expected;
    case "contains": return String(value).includes(String(expected));
    case "gt": return Number(value) > Number(expected);
    case "lt": return Number(value) < Number(expected);
    case "gte": return Number(value) >= Number(expected);
    case "lte": return Number(value) <= Number(expected);
    default: return false;
  }
}

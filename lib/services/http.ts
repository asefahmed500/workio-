export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  timeout?: number;
}

export interface HttpResponse {
  success: boolean;
  status: number;
  statusText: string;
  data: unknown;
  error?: string;
  durationMs?: number;
}

export async function httpRequest(options: HttpRequestOptions): Promise<HttpResponse> {
  const start = Date.now();

  try {
    const fetchOptions: RequestInit = {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
    };

    if (options.body && ["POST", "PUT", "PATCH"].includes(options.method)) {
      fetchOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    const res = await fetch(options.url, fetchOptions);
    const contentType = res.headers.get("content-type");
    let responseData: unknown;

    if (contentType?.includes("application/json")) {
      responseData = await res.json();
    } else {
      responseData = await res.text();
    }

    return {
      success: res.ok,
      status: res.status,
      statusText: res.statusText,
      data: responseData,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      statusText: "Error",
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      durationMs: Date.now() - start,
    };
  }
}

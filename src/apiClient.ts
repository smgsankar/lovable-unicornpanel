const LOVABLE_DELAY_MS = 500;
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

export type AppEnv =
  | "lovable-dev"
  | "lovable"
  | "development"
  | "staging"
  | "production";

type QueryParamValue = string | number | boolean | null | undefined;

export interface FetchOptions
  extends Omit<RequestInit, "body" | "method" | "headers"> {
  method?: RequestInit["method"];
  query?: Record<string, QueryParamValue> | URLSearchParams;
  headers?: HeadersInit;
  body?: RequestInit["body"] | Record<string, unknown> | unknown[];
}

export interface GcsUploadTicket {
  file_path?: string;
  file_url?: string;
  path?: string;
  url?: string;
}

export interface UploadFileViaGcsOptions {
  route: string;
  options?: Record<string, any>;
  file: File;
}

const appEnv =
  (import.meta.env.VITE_APP_ENV as AppEnv | undefined) ?? "development";

const isLovableEnvironment = appEnv.toLowerCase().includes("lovable");

function isBodyInit(value: unknown): value is BodyInit {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return true;
  }

  if (value instanceof Blob) {
    return true;
  }

  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
    return true;
  }

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return true;
  }

  if (
    typeof URLSearchParams !== "undefined" &&
    value instanceof URLSearchParams
  ) {
    return true;
  }

  if (ArrayBuffer.isView(value)) {
    return true;
  }

  if (
    typeof ReadableStream !== "undefined" &&
    value instanceof ReadableStream
  ) {
    return true;
  }

  return false;
}

function buildUrl(route: string, query?: FetchOptions["query"]): URL {
  const isAbsolute = ABSOLUTE_URL_PATTERN.test(route);
  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  if (!isAbsolute && !baseOrigin) {
    throw new Error(
      "Cannot resolve relative URL without window.location.origin"
    );
  }

  const url = isAbsolute ? new URL(route) : new URL(route, baseOrigin);

  if (!query) {
    return url;
  }

  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    return url;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

function prepareRequestInit(options: FetchOptions): RequestInit {
  const { method = "GET", query: _query, headers, body, ...rest } = options;

  const resolvedHeaders = new Headers(headers ?? {});
  const upperMethod = method.toUpperCase();
  const init: RequestInit = {
    method: upperMethod,
    headers: resolvedHeaders,
    ...rest,
  };

  if (body === undefined || body === null) {
    return init;
  }

  if (isBodyInit(body)) {
    if (upperMethod !== "GET" && upperMethod !== "HEAD") {
      init.body = body;
    }
    return init;
  }

  const isJsonAcceptable = upperMethod !== "GET" && upperMethod !== "HEAD";
  if (isJsonAcceptable) {
    if (!resolvedHeaders.has("Content-Type")) {
      resolvedHeaders.set("Content-Type", "application/json");
    }
    init.body = JSON.stringify(body);
  }

  return init;
}

async function executeRequest<T>(url: URL, init: RequestInit): Promise<T> {
  const response = await window.fetch(url.toString(), init);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Request failed with status ${response.status}${
        errorText ? `: ${errorText}` : ""
      }`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

/**
 * Typed wrapper around {@link window.fetch} that applies environment-aware mocking, query handling,
 * and request preparation.
 *
 * @template T Expected response payload type.
 * @param route Absolute URL or path-relative API route to request.
 * @param options Request configuration including HTTP method, headers, query parameters, and body.
 * @param options.method HTTP method to use. Defaults to `GET`.
 * @param options.headers Headers to send with the request. Merged into a {@link Headers} instance.
 * @param options.query Object or {@link URLSearchParams} appended to the URL as query string values.
 * @param options.body Any payload to be sent with the request. Objects/arrays are JSON stringified for
 * non-GET/HEAD methods unless already provided as a {@link BodyInit}.
 * @param mockResponse Response to resolve with when {@link APP_ENV} includes "lovable".
 * @returns A promise resolving to the parsed response payload typed as {@link T}.
 * @throws When a mock response is required but missing, or when the network response is not ok.
 */
export async function fetch<T>(
  route: string,
  options: FetchOptions = {},
  mockResponse: T
): Promise<T> {
  if (isLovableEnvironment) {
    if (mockResponse === undefined) {
      throw new Error(
        "Mock response must be provided when VITE_APP_ENV includes 'lovable'."
      );
    }

    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(mockResponse);
      }, LOVABLE_DELAY_MS);
    });
  }

  const url = buildUrl(route, options.query);
  const init = prepareRequestInit(options);

  return executeRequest<T>(url, init);
}

const mockGetTicketResponse: GcsUploadTicket = {
  file_path: "/uploads/example-file.txt",
  file_url: "https://www.example.com/your-bucket/uploads/example-file.txt",
};

/**
 * Retrieves an indirect GCS upload ticket from the application service, performs the signed PUT upload,
 * and returns the final storage path of the uploaded file.
 *
 * @param params Configuration for the upload flow.
 * @param params.route API endpoint that issues the GCS ticket, expected to return a signed URL and GCS path.
 * @param params.options Optional query parameters forwarded to the ticket endpoint (for metadata, ACL, etc.).
 * @param params.file File object whose contents will be uploaded via the signed URL using a PUT request.
 * @returns Resolves to the GCS path where the file was stored.
 * @throws When the ticket response is missing the signed URL or destination path, or when either network request fails.
 */
export async function uploadFileToGcs(
  params: UploadFileViaGcsOptions
): Promise<string> {
  const { route, options, file } = params;

  const requestOptions: FetchOptions = {
    method: "GET",
    query: options,
  };

  const response = await fetch<GcsUploadTicket>(
    route,
    requestOptions,
    mockGetTicketResponse
  );

  const signedUrl = response.file_url ?? response.url;
  const gcsPath = response.file_path ?? response.path;

  if (!signedUrl || !gcsPath) {
    throw new Error("Invalid response: missing signed URL or file path.");
  }

  const fileBuffer = await file.arrayBuffer();
  await fetch<void>(
    signedUrl,
    {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: fileBuffer,
    },
    undefined
  );

  return gcsPath;
}

/**
 * Requests a signed download URL for a file already stored in GCS.
 *
 * @param filePath Path (within GCS) of the file to download.
 * @param route API endpoint that issues the download URL.
 * @param options Optional query parameters forwarded to the ticket endpoint.
 * @returns Resolves to a public or signed download URL for the requested file.
 * @throws When the ticket response is missing the `file_url` field or the request fails.
 */
export async function getGcsDownloadUrl(
  filePath: string,
  route: string,
  options: Record<string, any> = {}
): Promise<string> {
  const requestOptions: FetchOptions = {
    method: "GET",
    query: { ...options, file_path: filePath },
  };

  const response = await fetch<Pick<GcsUploadTicket, "file_url">>(
    route,
    requestOptions,
    { file_url: "https://www.example.com/your-bucket/uploads/example-file.txt" }
  );

  if (!response.file_url) {
    throw new Error("Invalid response: missing file URL.");
  }

  return response.file_url;
}

export { appEnv as APP_ENV };

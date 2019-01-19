export interface ITransporter {
  fetch(endpoint: string, options: any): Promise<any>;
}

export interface RequestInit {
  /**
   * The request method, e.g., GET, POST.
   */
  method?: string;

  /**
   * Any headers you want to add to your request, contained within a Headers object or an object literal with ByteString values.
   */
  headers?: Headers | Object;

  /**
   * Any body that you want to add to your request: this can be a Blob, BufferSource, FormData,
   * URLSearchParams, ReadableStream, or USVString object.
   *
   * Note that a request using the GET or HEAD method cannot have a body.
   */
  body?: Blob | BufferSource | FormData | URLSearchParams | ReadableStream | string | null;

  /**
   * The mode you want to use for the request, e.g., cors, no-cors, same-origin, or navigate.
   * The default is cors.
   *
   * In Chrome the default is no-cors before Chrome 47 and same-origin starting with Chrome 47.
   */
  mode?: string;

  /**
   * The request credentials you want to use for the request: omit, same-origin, or include.
   * The default is omit.
   *
   * In Chrome the default is same-origin before Chrome 47 and include starting with Chrome 47.
   */
  credentials?: string;

  /**
   * The cache mode you want to use for the request: default, no-store, reload, no-cache, or force-cache.
   */
  cache?: string;

  /**
   * The redirect mode to use: follow, error, or manual.
   *
   * In Chrome the default is follow before Chrome 47 and manual starting with Chrome 47.
   */
  redirect?: string;

  /**
   * A USVString specifying no-referrer, client, or a URL. The default is client.
   */
  referrer?: string;

  /**
   * Contains the subresource integrity value of the request (e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).
   */
  integrity?: string;

  /**
   * An AbortSignal to set request’s signal.
   */
  signal?: AbortSignal;
}

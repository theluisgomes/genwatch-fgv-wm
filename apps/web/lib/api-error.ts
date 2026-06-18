export class ApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(
      "GenWatch API is not reachable. Start it in another terminal: make dev-api",
    );
    this.name = "ApiUnavailableError";
    this.cause = cause;
  }
}

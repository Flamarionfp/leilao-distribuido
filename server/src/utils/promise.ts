export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );

  return Promise.race([promise, timeout]);
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

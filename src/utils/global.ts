export type ResultOrErrorResponse<T> = [T | null, Error | null];

export const resultOrError = async <T>(
  promise: Promise<T>
): Promise<ResultOrErrorResponse<T>> => {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    // Normalize to an Error so the [result, error] tuple never lies about its type.
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
};

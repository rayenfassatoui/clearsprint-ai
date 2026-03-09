/**
 * Executes an array of asynchronous tasks with a concurrency limit.
 * Useful for rate-limiting API requests (e.g., to the Linear API).
 */
export async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item) => task(item)));
    results.push(...batchResults);
  }

  return results;
}

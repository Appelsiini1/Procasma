/**
 * A debounce function that delays the execution of an argument
 * function until the set delay has passed. If a different
 * key is used, the last buffered request is executed immediately.
 */
export function debounceCheckKey<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (key: string, ...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  let lastKey: string | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (key: string, ...args: Parameters<T>) => {
    // If the key is different, execute the pending update immediately
    if (lastKey !== null && lastKey !== key && lastArgs) {
      func(...lastArgs);
    }

    clearTimeout(timeout);
    lastKey = key;
    lastArgs = args;

    timeout = setTimeout(() => {
      func(...args);
      lastKey = null;
      lastArgs = null;
    }, wait);
  };
}

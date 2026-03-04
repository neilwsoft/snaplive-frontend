/**
 * Dynamically load external scripts
 * Prevents duplicate loading and provides Promise-based API
 */

const loadedScripts = new Set<string>();

export function loadScript(src: string): Promise<void> {
  // Return immediately if script is already loaded
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }

  // Check if script tag already exists in DOM
  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    loadedScripts.add(src);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
}

export function unloadScript(src: string): void {
  const script = document.querySelector(`script[src="${src}"]`);
  if (script) {
    document.head.removeChild(script);
    loadedScripts.delete(src);
  }
}

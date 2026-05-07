export function detectDevice() {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const mem = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const isLowEnd = (mem && mem < 3) || (cores && cores < 4);
  return { isMobile, isLowEnd: !!isLowEnd };
}

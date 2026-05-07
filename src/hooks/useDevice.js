import { useState, useEffect } from 'react';
export function useDevice() {
  const [device, setDevice] = useState({ isMobile:false, isLowEnd:false, isTablet:false });
  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    // Heuristic: low RAM or slow CPU
    const mem = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const isLowEnd = (mem && mem < 3) || (cores && cores < 4);
    setDevice({ isMobile, isTablet, isLowEnd: !!isLowEnd });
  }, []);
  return device;
}

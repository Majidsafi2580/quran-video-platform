import { useContext } from 'react';
import { ToastContext } from '../components/shared/ToastProvider';
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { success:console.log, error:console.error, info:console.log, warning:console.warn };
  return ctx;
}

// KkiaPay Widget Types
interface KkiapayConfig {
  amount: number;
  key: string;
  sandbox?: boolean;
  phone?: string;
  name?: string;
  email?: string;
  data?: any;
  callback?: string;
  theme?: string;
  position?: 'left' | 'right' | 'center';
}

interface KkiapayResponse {
  transactionId: string;
  [key: string]: any;
}

interface Window {
  openKkiapayWidget: (config: KkiapayConfig) => void;
  addSuccessListener: (callback: (response: KkiapayResponse) => void) => void;
  addFailedListener: (callback: (error: any) => void) => void;
}

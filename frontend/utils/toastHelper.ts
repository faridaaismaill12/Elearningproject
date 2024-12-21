import { toast } from 'react-toastify';

export const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'info':
      toast.info(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    default:
      toast(message);
  }
};

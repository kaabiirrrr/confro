import toast from 'react-hot-toast';

/** Use in axios catch blocks — 401 is already toasted by setupAxiosAuthToast (deduped). */
export function toastApiError(error, fallbackMessage) {
  if (error?.response?.status === 401) return;
  toast.error(error?.response?.data?.message || fallbackMessage);
}

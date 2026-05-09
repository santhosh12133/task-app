export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;

  return String(message);
}

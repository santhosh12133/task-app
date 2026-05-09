import { format, isValid, parseISO } from 'date-fns';

export function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return 'No due date';
  const date = value instanceof Date ? value : parseISO(value);
  if (!isValid(date)) return 'No due date';
  return format(date, pattern);
}

export function formatRelativeClock(value) {
  if (!value) return 'Flexible';
  const date = value instanceof Date ? value : parseISO(value);
  if (!isValid(date)) return 'Flexible';
  return format(date, 'h:mm a');
}

export function toShortDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? format(date, 'EEE, MMM d') : '';
}

export default function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-danger">{message}</p>;
}

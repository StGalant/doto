export default function handleError(err: any) {
  console.error(err)
  const message = err instanceof TypeError
    ? 'Network error'
    : err.body?.message || err.message
  return new Error(message)
}

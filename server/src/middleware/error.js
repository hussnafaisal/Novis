export function notFound(req, res) {
  res.status(404).json({ message: 'The requested page or service was not found.' });
}

function friendlyZod(error) {
  if (!error?.issues?.length) return null;
  return error.issues.map((issue) => issue.message).filter(Boolean).join(' ');
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);

  const zodMessage = friendlyZod(error);
  if (zodMessage) return res.status(400).json({ message: zodMessage });

  if (error?.code === 'P2002') return res.status(409).json({ message: 'This record already exists.' });
  if (error?.code === 'P2025') return res.status(404).json({ message: 'The requested record was not found.' });

  const status = Number(error?.status || 500);
  const message = status >= 500
    ? 'Something went wrong on the server. Please try again.'
    : (error?.message || 'Something went wrong. Please try again.');

  res.status(status).json({ message });
}

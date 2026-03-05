exports.extractEmailFromClientId = (clientID) => {
  if (!clientID) throw new Error('clientID must be provided');

  const [, middle] = clientID.split('::');
  const [, username] = middle.split('/CN=');

  return username;
};

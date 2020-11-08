const jwt = require('jsonwebtoken');
const secret = 'tKB9XPD%GOW%DRxIZ9WW0TGfDK0ac0';

module.exports = (req, res, next) => {
  const authToken = req.headers['authorization'];

  if (authToken !== undefined) {
    const bearer = authToken.split(' ');
    const token = bearer[1];

    try {
      const decoded = jwt.verify(token, secret);

      if (decoded.role === 1) next();
      else {
        res.status(403).send('Você não tem permissão.');
        return;
      }
    } catch (error) {
      res.status(403).send('Você não está autorizado.');
      return;
    }
  } else {
    res.status(403).send('Você não está autorizado.');
    return;
  }
};

import fetch from 'node-fetch';
import bearerToken from 'express-bearer-token';
import opts from '../opts';

export const cjAuthProvider = (app, logger) => {
  logger.info('cjAuthProvider');
  app.use(bearerToken());
  app.get('/api/user/:userId', async (req, res) => {
    try {
      const auth = {
        headers: {
          Authorization: `Bearer ${req.token}`,
        },
      };
      const url = `${opts.CJ_USER_URL}${req.params.userId}`;
      const resp = await fetch(url, auth);
      if (resp.ok) {
        const data = await resp.json();
        res.status(200).send(data);
      } else {
        res.status(resp.status).send(resp.statusText);
      }
    } catch (err) {
      logger.error(err);
      res.status(500).send(err.message);
    }
  });
};

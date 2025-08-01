const express = require('express');
const axios = require('axios');
const app = express();

const WEBHOOK_URL = process.env.WEBHOOK_URL;

app.get('/api', async (req, res) => {
  const username = req.query.name || 'Unknown';
  const game = req.query.game || 'Unknown';

  if (!process.env.SECRET_KEY || req.query.key !== process.env.SECRET_KEY) {
    return res.status(403).send('forbidden');
  }

  try {
    await axios.post(WEBHOOK_URL, {
      embeds: [{
        title: 'Игрок отправил запрос',
        description: `**Имя:** ${username}\n**Игра:** ${game}`,
        color: 16753920
      }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.send('ok');
  } catch (err) {
    console.error('Webhook error:', err.response?.status, err.response?.data);
    res.status(500).send('fail');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

const express = require('express');
const axios = require('axios');
const app = express();

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const SECRET_KEY = process.env.SECRET_KEY;

function fromHex(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

function xorCrypt(input, key) {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    const inputChar = input.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    output += String.fromCharCode(inputChar ^ keyChar);
  }
  return output;
}

const XOR_KEY = 'xyupizda_ochko';

const usedTokens = new Set();

app.get('/api', async (req, res) => {
  const username = req.query.name || 'Unknown';
  const game = req.query.game || 'Unknown';
  const encryptedKey = req.query.key;

  if (!encryptedKey) return res.status(403).send('forbidden');

  const decryptedKey = xorCrypt(fromHex(encryptedKey), XOR_KEY);

  if (!SECRET_KEY || decryptedKey !== SECRET_KEY) {
    return res.status(403).send('forbidden');
  }

  // Проверяем, использовался ли токен раньше
  if (usedTokens.has(encryptedKey)) {
    return res.status(403).send('token already used');
  }

  // Помечаем токен как использованный
  usedTokens.add(encryptedKey);

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

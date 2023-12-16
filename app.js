const express = require('express');
const axios = require('axios');
const { generate_next_mock_situation } = require('./public/controllers/situationController');

const app = express();
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/generate_options_from_chat_gpt', async (req, res) => {
  const prompt = req.body.message;
  const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
    prompt,
    max_tokens: 100,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });
  res.json({ message: response.data.choices[0].text });
});

app.post('/generate_next_situation', async (req, res) => {
  const option = req.body.option;
  const situation = req.body.situation;
  const new_situation = generate_next_mock_situation(situation, option);
 
  res.json({ situation: new_situation });
});

app.post('/generate-image', async (req, res) => {
  const description = req.body.description;
  const response = await axios.post('https://api.openai.com/v1/dalle-generate', {
    description,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });
  res.json({ imageUrl: response.data.imageUrl });
});

app.listen(3000, () => console.log('Server running on port 3000'));
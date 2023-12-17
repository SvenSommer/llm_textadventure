const express = require('express');
const axios = require('axios');
const {generate_next_situation, generate_next_mock_situation } = require('./public/controllers/situationController');
const { query_image } = require('./public/controllers/imageController');

const app = express();
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.post('/generate_next_situation', async (req, res) => {
  const option = req.body.option;
  const situation = req.body.situation;
  const language = req.body.language;
  const new_situation = await generate_next_situation(situation, option, language);
 
  res.json({ situation: new_situation });
});

app.post('/generate-image', async (req, res) => {
  if (!req.body || !req.body.situation_image) {
    return res.status(400).json({ error: 'No situation image provided' });
  }
  const situation_image = req.body.situation_image;
   imageUrl = await query_image(situation_image);
  return res.json({ imageUrl });
  
});

app.listen(3000, () => console.log('Server running on port 3000'));
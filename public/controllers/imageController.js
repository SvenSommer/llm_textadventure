const OpenAI = require('openai');

async function query_image(prompt) {
  // Retrieve the API key from environment variables
  const apiKey = process.env.OpenApiKEY;
  if (!apiKey) {
    throw new Error('API key is missing.');
  }

  // Initialize the OpenAI client with the API key
  const openai = new OpenAI({ apiKey });

  try {
    // Send a request to generate an image
    console.log('Sending prompt to OpenAI to generate image:');
    const response = await openai.images.generate({
      model: process.env.OpenApiImageModel,
      prompt: prompt,
      n: 1,
      size: process.env.OpenApiImageSize,
      user: process.env.OpenApiUSER
    });

    // Extract the URL of the generated image
    const imageUrl = response.data[0].url;
    console.log('Generated image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error.message);

    // Error handling for different scenarios
    if (error.response) {
      // The request was made, but the server responded with a non-2xx status code
      console.error('Server response error:', error.response.status);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error('No response received from OpenAI API');
    } else {
      // An error occurred in setting up the request
      console.error('Error setting up image generation request');
    }
    throw error;
  }
}

exports.query_image = query_image;

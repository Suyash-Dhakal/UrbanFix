import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const endpointUri = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

export const getEmbeddings = async (inputText) => {
  
  try {
    const response = await axios.post(
      endpointUri,
      { input: inputText },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    const embedding = response.data?.data[0]?.embedding;
    return embedding; // ✅ Return the embedding to be used elsewhere
  } catch (error) {
    console.error('Error fetching embeddings:', error.response?.data || error.message);
    throw new Error('Failed to fetch embeddings');
  }
};



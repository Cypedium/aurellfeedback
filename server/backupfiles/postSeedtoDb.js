const axios = require('axios');
const fs = require('fs');

// Load JSON data from file
const cardData = JSON.parse(fs.readFileSync('seed.json', 'utf8'));



// Function to post each card entry
async function postSeedtoDb() {
  for (const entry of cardData) {
    try {
      const { rating, comment, productId, username } = entry;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/card`, {
        rating,
        comment,
        productId,
        username,
        withCredentials: true
      }
    );
      console.log(`✅ Posted card for ${username}: ${response.data.message}`);
    } catch (error) {
      console.error(`❌ Failed to post card for ${entry.username}:`, error.message);
    }
  }
}

postSeedtoDb();
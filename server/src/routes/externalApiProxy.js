const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to retry axios GET request with delay
const axiosGetWithRetry = async (url, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1} failed for ${url}, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

// Proxy route to forward requests to external API to avoid CORS issues
router.get('/totalusers', async (req, res) => {
  try {
    const response = await axiosGetWithRetry('https://sc.ecombullet.com/api/dashboard/totalusers');
    console.log('Successfully fetched external totalusers');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching external totalusers after retries:', error.message);
    console.error('Full error:', error);
    // Return fallback mock data with 200 status to avoid frontend breakage
    const mockData = { totalUsers: 0, message: 'Mock data due to external API failure' };
    res.status(200).json(mockData);
  }
});

module.exports = router;

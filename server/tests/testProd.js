const axios = require("axios");
import config from "../config";
useConfi

const BASE_URL = "https://aurellcard-backend.fly.dev";

axios.get(`${BASE_URL}/card`)
  .then(res => {
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  })
  .catch(err => {
    console.error("Error:", err.message);
  });

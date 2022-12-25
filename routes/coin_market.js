const express = require("express");
const CoinMarket = require("../models/coin_market");
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const coins = await CoinMarket.findAll();
    if (!coins.length > 0) return res.send({ message: "No coins found." });

    res.status(200).send(coins);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

module.exports = router;

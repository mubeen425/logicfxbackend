const express = require("express");
const authRouter = require("../routes/Auth");
const depositRouter = require("../routes/Deposits");
const withdrawRouter = require("../routes/Withdraw");
const walletRouter = require("../routes/Wallet");
const userWatchlistRouter = require("../routes/user_watchlist");
const adminWatchlistRouter = require("../routes/admin_watchlist");
const activeTradeRouter = require("../routes/Active_Trades");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/user", authRouter);
  app.use("/api/deposit", depositRouter);
  app.use("/api/withdraw", withdrawRouter);
  app.use("/api/wallet", walletRouter);
  app.use("/api/userwatchlist", userWatchlistRouter);
  app.use("/api/adminwatchlist", adminWatchlistRouter);
  app.use("/api/activetrade", activeTradeRouter);
};

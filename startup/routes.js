const express = require("express");
const cors = require("cors");
const authRouter = require("../routes/Auth");
const depositRouter = require("../routes/Deposits");
const withdrawRouter = require("../routes/Withdraw");
const walletRouter = require("../routes/Wallet");
const userWatchlistRouter = require("../routes/user_watchlist");
const adminWatchlistRouter = require("../routes/admin_watchlist");
const activeTradeRouter = require("../routes/Active_Trades");
const activeTradeHistory = require("../routes/trade_history");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/user", authRouter);
  app.use("/api/deposit", depositRouter);
  app.use("/api/withdraw", withdrawRouter);
  app.use("/api/wallet", walletRouter);
  app.use("/api/userwatchlist", userWatchlistRouter);
  app.use("/api/adminwatchlist", adminWatchlistRouter);
  app.use("/api/activetrade", activeTradeRouter);
  app.use("/api/tradehistory", activeTradeHistory);
};

// export const Baseurl = "http://192.168.2.102:4000";
// //post requests
// const userLogin = "/api/user/login" //in request body {email,password}
// const userRegister="/api/user/register"//in request body{user_name,first_name,last_name,email,password}
// export const post_deposit = "/api/deposit/";// in request body {amount,user_id} in header{x-auth-token}
// export const post_withdraw = "/api/withdraw/";//in request body {amount,user_id} in header{x-auth-token}
// //get requests
// export const get_watchlist = "/api/userwatchlist/"// in params user_id
// export const get_adminwatchlist="/api/adminwatchlist/"

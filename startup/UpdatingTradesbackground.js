const config = require("config");
const axios = require("axios");
const { Active_Trade } = require("../models/active_trades");

module.exports = async () => {
  try {
    console.log("in function");
    const active_trades = await Active_Trade.findAll();
    if (active_trades.length === 0) return console.log(active_trades.length);

    let res = await getCoinMarketData();
    let data = res.data.data;
    if (data.length === 0) return console.log("returned from data");
    console.log(data);
    if (data) {
      active_trades.forEach((x) => {
        const { crypto_name, purchase_units, take_profit, stop_loss } = x;
        data.forEach((i) => {
          console.log("looping data");
          if (i.name === crypto_name) {
            console.log("condition true--");
            let price = i.quote.USD.price;
            // console.log(price);
            let val = price * purchase_units;
            if (val >= take_profit + x.trade) {
              console.log("in profit");
              deleteTrade(x.id, price);
            } else if (val <= x.trade - stop_loss) {
              console.log("in loss");
              deleteTrade(x.id, price);
            }
          }
        });
      });
      return console.log("ok");
    }
    return console.log("ok");
  } catch (error) {
    return console.log(error.message);
  }
};

const getCoinMarketData = async () => {
  return await axios
    .get(config.get("marketApi"))
    .catch((error) => console.log(error));
};

const deleteTrade = async (id, price) => {
  console.log(id, price);
  return await axios
    .delete(`${config.get("baseurl")}/api/activetrade/` + id, {
      data: {
        crypto_sale_price: price,
      },
    })
    .catch((error) => console.log(error.response.data));
};

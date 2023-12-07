require('dotenv').config();
const express = require('express');
const app = express();
const cron = require('node-cron');
const baseURL = 'https://api.freecurrencyapi.com/v1/latest';
const apiKeyParam = '?apikey=';
const apiKey = process.env.FCA_API;
const baseCurrencyParam = '&base_currency=';
const currencySymbol = ['HKD', 'USD', 'CNY', 'GBP'];
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

app.use(cors({
  origin: process.env.SERVER_URL
}));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

///using freecurrencyapi

const fetchCurrencyRates = async(symbol) => {
  const fetchURL = `${baseURL}${apiKeyParam}${apiKey}${baseCurrencyParam}${symbol}`;
  try {
    const response = await axios.get(fetchURL);
    const currencyData = response.data;
    fs.writeFile(`./currency_rates/base-${symbol}.json`, JSON.stringify(currencyData), (err) => {
      if (err) {
        console.error('Error writing JSON to file:', err);
        return;
      }
      console.log('JSON currency rates data has been written to file successfully.');
    });

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const runOnceDaily = '0 0 0 * * *';
cron.schedule( runOnceDaily, () => {
  currencySymbol.map(symbol => fetchCurrencyRates(symbol))
    .then(() => {
      console.log('Currency rates fetched successfully.');
    })
    .catch(error => {
      console.error('An error occurred while fetching currency rates:', error);
    });
});

app.listen(3002, () => {
  console.log('Listening on port 3002');
});
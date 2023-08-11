const telegramBot = require('node-telegram-bot-api');
const request = require('request');
const countryList = require('country-list');
require('dotenv').config();



const TOKEN = process.env.TOKEN;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Your OpenWeatherMap API key

const bot = new telegramBot(TOKEN, { polling: true });

bot.on('message', (message) => {
  const chat_id = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    bot.sendMessage(chat_id, 'Welcome! Please choose an action:', {
      reply_markup: {
        keyboard: [['Get Weather'],['help']],
        one_time_keyboard: true,
      },
    });
  } else if (text === 'Get Weather') {
    bot.sendMessage(chat_id, 'Please enter the city name to get weather information:');
  }
  else if (text === 'help') {
    bot.sendMessage(chat_id, 'Please contact with me if something not work ');
  } else {
    // Construct the API URL
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(text)}&appid=${WEATHER_API_KEY}&units=metric`;

    // Make the API request to OpenWeatherMap
    request(apiUrl, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body);
        if (data.main && data.weather) {
          const temperature = data.main.temp;
          const weatherDescription = data.weather[0].description;
          const country = data.sys.country;
          const countryName = countryList.getName(country);
          
          const message = `Weather in ${text} (${countryName}):\nTemperature: ${temperature}°C\nDescription: ${weatherDescription}`;
          bot.sendMessage(chat_id, message);
        } else {
          bot.sendMessage(chat_id, `I'm sorry, I couldn't determine the weather information for ${text}.`);
        }
      } else {
        bot.sendMessage(chat_id, `An error occurred while fetching weather data for ${text}.`);
      }
    });
  }
});

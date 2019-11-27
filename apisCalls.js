require('dotenv').config();
const fetch = require('node-fetch');

const getRandomPics = () => {
  let images = [];
  return fetch(
    'https://api.unsplash.com/photos/random?orientation=landscape&count=9',
    {
      method: 'GET',
      headers: {
        Authorization: process.env.US_AUTHO
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      return data;
    });
};

const getPicsOf = searchTerm => {
  const number = randomNumber();
  return fetch(
    `https://api.unsplash.com/search/photos?page=${number}&per_page=9&orientation=landscape&query=${searchTerm}`,
    {
      method: 'GET',
      headers: {
        Authorization: process.env.US_AUTHO
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      return data.results;
    });
};

const getColors = imgUrl => {
  let url = removeQs(imgUrl);
  let colors = [];
  return fetch(
    `https://apicloud-colortag.p.rapidapi.com/tag-url.json?palette=w3c&sort=relevance&url=${url}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'apicloud-colortag.p.rapidapi.com',
        'x-rapidapi-key': process.env.CT_APIKEY
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      colors = data;
      return colors;
    })
    .catch(err => {
      console.log(err);
    });
};

function removeQs(url) {
  return url.split('?')[0];
}

const randomNumber = () => {
  return Math.floor(Math.random() * 100) + 1;
};
module.exports = {
  getRandomPics,
  getPicsOf,
  getColors
};

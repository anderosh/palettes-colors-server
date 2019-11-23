require('dotenv').config();
const fetch = require('node-fetch');

const getRandomPics = () => {
  let images = [];
  return fetch(
    'https://api.unsplash.com/photos/random?orientation=landscape&count=10',
    {
      method: 'GET',
      headers: {
        Authorization: process.env.US_AUTHO
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      // urlImgs.url = data.map(e => e.urls.small);
      // urlImgs.id = data.map(e => e.id);
      return data;
    });
};

const getPicsOf = searchTerm => {
  return fetch(
    `https://api.unsplash.com/search/photos?page=1&orientation=landscape&query=${searchTerm}`,
    {
      method: 'GET',
      headers: {
        Authorization: process.env.US_AUTHO
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      let urlImgs = data.results.map(e => e.urls.full);
      return urlImgs;
    });
};

const getColors = imgUrl => {
  console.log(imgUrl);
  let url = removeQs(imgUrl);
  let colors = [];
  return fetch(
    `https://apicloud-colortag.p.rapidapi.com/tag-url.json?palette=simple&sort=relevance&url=${url}`,
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

module.exports = {
  getRandomPics,
  getPicsOf,
  getColors
};

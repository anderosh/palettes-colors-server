const fetch = require("node-fetch");

const getRandomPics = () => {
  return fetch(
    "https://api.unsplash.com/photos/random?orientation=landscape&count=10",
    {
      method: "GET",
      headers: {
        Authorization:
          "Client-ID 497fdccbd300214c61c9b79bbab0667ace4e475135b5d514b5d5726a5d06653e"
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      let urlImgs = data.map(e => e.urls.full);
      return urlImgs;
    });
};

const getPicsOf = searchTerm => {
  return fetch(
    `https://api.unsplash.com/search/photos?page=1&orientation=landscape&query=${searchTerm}`,
    {
      method: "GET",
      headers: {
        Authorization:
          "Client-ID 497fdccbd300214c61c9b79bbab0667ace4e475135b5d514b5d5726a5d06653e"
      }
    }
  )
    .then(res => res.json())
    .then(function(data) {
      let urlImgs = data.results.map(e => e.urls.full);
      return urlImgs;
    });
};

module.exports = {
  getRandomPics,
  getPicsOf
};

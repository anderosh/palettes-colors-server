const apisCalls = require('./apisCalls');
const express = require('express');
const app = express();
const port = 3001;

// mongodb + srv://admin:<password>@prueba1-s8o2u.mongodb.net/test?retryWrites=true&w=majority

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const connectionString = process.env.DB_ADMINPASS;
const mongoose = require('mongoose');
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// S C H E M A S //
const usersSchema = new mongoose.Schema({
  name: String,
  last_name: String,
  email: String,
  password: String,
  register_date: Date,
  favorites: []
});

const paletteSchema = new mongoose.Schema({
  name: String,
  user_id: String,
  creation_date: Date,
  likes: Number,
  colors: []
});

const favoritesSchema = new mongoose.Schema({
  pelette_id: String,
  user_id: String
});

const commentsSchema = new mongoose.Schema({
  palette_id: String,
  user_id: String,
  title: String,
  message: String,
  creation_date: Date
});

const unsplashtest = new mongoose.Schema({
  id: String,
  url: String
});

// M O D E L S //
const User = mongoose.model('User', usersSchema);
const Palette = mongoose.model('Palette', paletteSchema);
const Favorite = mongoose.model('Favorite', favoritesSchema);
const Comment = mongoose.model('Comment', commentsSchema);
const Unsplashtest = mongoose.model('Unsplashtest', unsplashtest);

// M i d d l e w a r e s
// app.use(express.static("public"));
app.use(express.json());

//  R O U T E S //

app.get('/top-palettes', async (req, res) => {
  try {
    const topPalettes = await Palette.find().sort({ likes: -1 });
    res.json(topPalettes);
  } catch (err) {
    console.log(err);
  }
});

app.get('/latest-palettes', async (req, res) => {
  try {
    const latesPalettes = await Palette.find().sort({ creation_date: -1 });
    res.json(latesPalettes);
  } catch (err) {
    console.log(err);
  }
});

app.post('/new-user', async (req, res) => {
  const newUser = req.body;
  newUser.register_date = new Date();

  try {
    const user = await User.create(newUser);
    res.json(user);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

// app.get("/new-palette", async (req, res) => {
//   try {
//     const randomPics = await apisCalls.getRandomPics();
//     res.json(randomPics);
//   } catch (err) {
//     if (err) {
//       console.log(err);
//     }
//   }
// });

// DB to T E S T //

// app.get('/new-palette', async (req, res) => {
//   try {
//     const randomPics = await Unsplashtest.find();
//     res.json(randomPics);
//   } catch (err) {
//     if (err) {
//       console.log(err);
//     }
//   }
// });

app.get('/new-palette', async (req, res) => {
  try {
    const randomPics = await apisCalls.getRandomPics();
    console.log(randomPics);
    res.json(randomPics);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.post('/new-palette', async (req, res) => {
  const newPalette = req.body.data.palette;
  console.log(newPalette);
  newPalette.creation_date = new Date();

  try {
    const palette = await Palette.create(newPalette);
    res.json(palette);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.get('/comments/:paletteId', async (req, res) => {
  const paletteId = req.params.paletteId;
  try {
    const comment = await Comment.find({ palette_id: paletteId });
    res.json(comment);
  } catch (err) {
    console.log(err);
  }
});

app.post('/new-comment', async (req, res) => {
  const newComment = req.body;
  newComment.creation_date = new Date();

  try {
    const comment = await Comment.create(newComment);
    res.json(comment);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});
// REAL CALL TO COLOR TAG//
// app.post('/get-colors', async (req, res) => {
//   imgUrl = req.body.data.url;
//   try {
//     const colors = await apisCalls.getColors(imgUrl);
//     console.log(colors);
//     res.json(colors);
//   } catch (err) {
//     if (err) {
//       console.log(err);
//     }
//   }
// });

const testColors = {
  tags: [
    { label: 'Brown', color: '#837164' },
    { label: 'Gray', color: '#6F7270' },
    { label: 'Blue', color: '#464B59' },
    { label: 'Beige', color: '#97947B' },
    { label: 'Cyan', color: '#96B2B1' },
    { label: 'Green', color: '#5C715F' }
  ]
};

//// T E S T I N G / / /
app.post('/get-colors', async (req, res) => {
  try {
    res.json(testColors);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

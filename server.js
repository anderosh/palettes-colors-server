const apisCalls = require('./apisCalls');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

const connectionString = process.env.DB_ADMINPASS;
const mongoose = require('mongoose');
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('MongoDB Connected');
});
mongoose.connection.on('error', err => {
  console.log('MongoDB connection error: ', err);
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

usersSchema.methods.encryptPassword = async password => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

usersSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

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

const requireUser = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      auth: false,
      message: 'No token provided'
    });
  }
  const decoded = jwt.verify(token, process.env.SECRET);
  req.userId = decoded.id;
  const user = await User.findById(decoded.id, { password: 0 });

  if (!user) {
    return res.status(404).send('No user found');
  }
  next();
};

//  R O U T E S //

app.post('/sing-up', async (req, res) => {
  const { name, last_name, email, password } = req.body;

  const user = new User({
    name,
    last_name,
    email,
    password,
    register_date: new Date()
  });

  try {
    user.password = await user.encryptPassword(user.password);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: 60 * 60 * 24
    });

    res.json({
      auth: true,
      token
    });
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body.data;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).send('Email not found');
  }
  const validPassword = await user.validatePassword(password);
  if (!validPassword) {
    return res.status(401).json({
      auth: false,
      token: null
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: 60 * 60 * 24
  });

  res.json({
    auth: true,
    token
  });
});

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

app.get('/my-palettes', requireUser, async (req, res) => {
  try {
    const myPalettes = await Palette.find({ user_id: req.userId }).sort({
      creation_date: -1
    });
    console.log(myPalettes);
    res.json(myPalettes);
  } catch (err) {
    console.log(err);
  }
});

app.get('/build-new-palette', requireUser, async (req, res) => {
  try {
    const randomPics = await apisCalls.getRandomPics();
    res.json(randomPics);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.get('/build-new-palette:category', requireUser, async (req, res) => {
  const category = req.params.category;
  try {
    const picsOf = await apisCalls.getPicsOf(category);
    res.json(picsOf);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.post('/new-palette', requireUser, async (req, res) => {
  const newPalette = req.body.palette;
  newPalette.creation_date = new Date();
  newPalette.user_id = req.userId;

  try {
    const palette = await Palette.create(newPalette);
    console.log('Palette: ', palette);
    res.json(palette);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

app.get('/comments/:paletteId', requireUser, async (req, res) => {
  const paletteId = req.params.paletteId;
  try {
    const comment = await Comment.find({ palette_id: paletteId });
    res.json(comment);
  } catch (err) {
    console.log(err);
  }
});

app.post('/new-comment', requireUser, async (req, res) => {
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
app.post('/get-colors', async (req, res) => {
  imgUrl = req.body.data.url;
  try {
    const colors = await apisCalls.getColors(imgUrl);
    res.json(colors);
  } catch (err) {
    if (err) {
      console.log(err);
    }
  }
});

// const testColors = {
//   tags: [
//     { label: "Brown", color: "#837164" },
//     { label: "Gray", color: "#6F7270" },
//     { label: "Blue", color: "#464B59" },
//     { label: "Beige", color: "#97947B" },
//     { label: "Cyan", color: "#96B2B1" },
//     { label: "Green", color: "#5C715F" }
//   ]
// }

// //// T E S T I N G / / /
// app.post("/get-colors", async (req, res) => {
//   try {
//     console.log(testColors)
//     res.json(testColors)
//   } catch (err) {
//     if (err) {
//       console.log(err)
//     }
//   }
// })

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

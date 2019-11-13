const express = require("express")
const app = express()
const port = 3000

const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/colorspalette", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// S C H E M A S //
const usersSchema = new mongoose.Schema({
  username: String,
  name: String,
  last_name: String,
  email: String,
  password: String,
  register_date: Date,
  favorites: []
})

const paletteSchema = new mongoose.Schema({
  name: String,
  user_id: String,
  creation_date: Date,
  likes: Number,
  colors: []
})

const favoritesSchema = new mongoose.Schema({
  pelette_id: String,
  user_id: String
})

const commentsSchema = new mongoose.Schema({
  user_id: String,
  title: String,
  message: String,
  creation_date: Date
})

// M O D E L S //
const User = mongoose.model("User", usersSchema)
const Palette = mongoose.model("Palette", paletteSchema)
const Favorite = mongoose.model("Favorite", favoritesSchema)
const Comment = mongoose.model("Comment", commentsSchema)

// M i d d l e w a r e s
// app.use(express.static("public"));
app.use(express.json())

//  R O U T E S //

app.get("/", async (req, res) => {
  try {
    const topPalettes = await Palette.find()
    res.json(topPalettes)
  } catch (err) {
    console.log(err)
  }
})

app.post("/new-palette", async (req, res) => {
  const newPalette = req.body
  // newPalette.creation_date = new Date()

  try {
    const palette = await Palette.create(newPalette)
    res.json(palette)
  } catch (err) {
    if (err) {
      console.log(err)
    }
  }
})

app.post("/new-comment", async (req, res) => {
  const newComment = req.body
  // newPalette.creation_date = new Date()

  try {
    const comment = await Comment.create(newComment)
    res.json(comment)
  } catch (err) {
    if (err) {
      console.log(err)
    }
  }
})

app.listen(port, () => console.log(`Server running on port ${port}`))

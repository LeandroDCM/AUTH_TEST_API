require('dotenv').config()
import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {routes} from './routes';

const app = express()

// config json response
app.use(express.json())
// use routes.ts file for routes
app.use(routes)
// Models
const {User} = require('./models/User')






// Register User Route
app.post('/auth/register', async(req, res) => {

  const {name, email , password, confirmPassword } = req.body;

  //validations
  if(!name) {
    return res.status(422).json({msg: "Name is required!"})
  }

  if(!email) {
    return res.status(422).json({msg: "Email is required!"})
  }

  if(!password) {
    return res.status(422).json({msg: "Password is required!"})
  }

  if(password !== confirmPassword) {
    return res.status(422).json({msg: "Passwords don't match"})
  }

  //check if user exists
  const userExists = await User.findOne({email: email})

  if(userExists) {
    return res.status(422).json({msg: "Email already in use!"})
  }

  // create password
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  //create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  })

  try {
    
    await user.save()

    res.status(201).json({
      msg: "User created successfully"
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      msg: "Error ocurred in server, try again later!"
    })

  }
})

// Login User Route

app.post('/auth/login', async (req, res) => {
  const {email, password } = req.body;

  //validation
  if(!email) {
    return res.status(422).json({msg: "Email is required!"})
  }

  if(!password) {
    return res.status(422).json({msg: "Password is required!"})
  }

  //check if user exists
  const user = await User.findOne({email: email})

  if(!user) {
    return res.status(404).json({msg: "User not found!"})
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password)

  if(!checkPassword) {
    return res.status(422).json({msg: "Invalid password!"})
  }

  try {

    const secret = process.env.SECRET as string;

    const token = jwt.sign(
      {
      id: user._id,
      },
      secret,)
    
    res.status(200).json({ msg: 'Successful authentication ', token})

  } catch (error) {
    console.log(error)

    res.status(500).json({
      msg: "Error ocurred in server, try again later!"
    })
  }
})

// Credentials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPassword}@authjwt.t9n0bba.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
  app.listen(3000)
  console.log('Connected to database')
}).catch((err) => console.log(err))


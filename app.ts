require('dotenv').config()
import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()

// config json response
app.use(express.json())

// Models
const {User} = require('./models/User')

// Open Route - Public Route
app.get('/', (req, res) => {
  res.status(200).json({msg: "Welcome"})
})

//Private Route 
app.get('/user/:id', checkToken, async(req, res) => {

  const id = req.params.id

  //check if users exists
  const user = await User.findById(id, '-password')

  if(!user) {
    return res.status(404).json({ msg: "User not found!"})
  }

  res.status(200).json({user})
})

function checkToken(req: any, res: any, next: any) {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1]

  if(!token) {
    return res.status(401).json({ msg: 'Access denied!'})
  }

  try {
    
    const secret = process.env.SECRET as string

    jwt.verify(token, secret)

    next()

  } catch (error) {
    console.log(error)
    res.status(400).json({msg: 'Invalid Token'})
  }
}


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


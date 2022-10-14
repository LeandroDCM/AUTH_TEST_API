import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const express = require('express');
const routes = express.Router();
// Models
const {User} = require('./models/User')

//Controllers
const UserController = require('./controllers/UserController');

// Open Route - Public Route
routes.get('/', (req: any, res: any) => {
  res.status(200).json({msg: "Welcome"})
})

//Private Route 
routes.get('/user/:id', checkToken, async(req: any, res: any) => {

  const id = req.params.id

  //check if users exists
  const user = await User.findById(id, '-password')

  if(!user) {
    return res.status(404).json({ msg: "User not found!"})
  }

  res.status(200).json({user})
})

//function to check if token is authorized to access private route
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
routes.post('/auth/register', UserController.register)

// Login User Route

routes.post('/auth/login', async (req: any, res: any) => {
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

export { routes };
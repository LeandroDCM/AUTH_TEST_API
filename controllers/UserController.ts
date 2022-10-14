const {User} = require('../models/User')
const bcrypt = require('bcrypt')
import jwt from 'jsonwebtoken'


module.exports = {
  async register(req: any, res: any) {
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
  },







  }
  
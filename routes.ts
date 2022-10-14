
const {checkToken} = require('./middleware/checkToken')
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
//function checkToken to check if token is authorized to access private route
routes.get('/user/:id', checkToken, UserController.userIndex)

// Register User Route
routes.post('/auth/register', UserController.register)

// Login User Route

routes.post('/auth/login', UserController.login)

export { routes };
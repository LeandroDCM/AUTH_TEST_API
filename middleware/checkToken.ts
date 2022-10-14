import jwt from 'jsonwebtoken'
const express = require('express');

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

module.exports = { checkToken }

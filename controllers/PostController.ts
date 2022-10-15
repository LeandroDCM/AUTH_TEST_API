const {Post} = require('../models/Post')
const {User} = require('../models/User')

module.exports = {

  async post(req: any, res: any) {
    const { post } = req.body;
    const id = req.params.id
    const user = await User.findById(id, '-password')
    const newPost = new Post({
      user: user.id,
      post
    })
    await newPost.save()
    return res.json(newPost)
  }
}


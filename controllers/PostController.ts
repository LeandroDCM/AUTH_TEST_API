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
    return res.json(newPost.post)
  },

  async updatePost(req: any, res: any) {
    const postid = req.params.postid;
    const id = req.params.id;
    const newPost = req.body;

    const user = await User.findById(id, '-password');
    const post = await Post.findById(postid);

    const userId = user._id
    const postUser = post.user

    if(userId.toString() === postUser.toString()) {
      await Post.findByIdAndUpdate(postid, newPost)
      return res.json(newPost)
    } else {
      return res.json({Error: 'Cannot update another users post.'})
    } 
  },
}


const {Post} = require('../models/Post')
const {User} = require('../models/User')

module.exports = {

  async post(req: any, res: any) {
    const { post } = req.body;
    const id = req.params.id
    const user = await User.findById(id, '-password')
    const newPost = new Post({
      name: user.name,
      user: user.id,
      post
    })
    await newPost.save()
    return res.json(newPost.post)
  },

  async update(req: any, res: any) {
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

  async delete(req: any, res: any) {
    try {
      const postid = req.params.postid;
      const userid = req.params.id;

      const thisPost = await Post.findById(postid)
      if (userid.toString() !== thisPost.user.toString()) {
        return res.send('Access denied. Cannot delete other users post.')
      }

      const post = await Post.findByIdAndDelete(postid);

      if (!post) res.status(404).send("No post found");
      res.status(200).send('Post deleted successfully');
    } catch (error) {
      res.status(500).send(error);
    }
  },
}


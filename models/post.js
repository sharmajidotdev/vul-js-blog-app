const posts = [];

module.exports = {
  posts,
  addPost: (post) => posts.push(post),
  findById: (id) => posts.find(p => p.id == id)
};
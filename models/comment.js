const comments = [];

module.exports = {
  comments,
  addComment: (comment) => comments.push(comment),
  findByPostId: (postId) => comments.filter(c => c.postId == postId)
};
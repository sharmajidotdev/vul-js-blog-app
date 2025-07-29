const users = [];

module.exports = {
  users,
  findByUsername: (username) => users.find(u => u.username === username),
  addUser: (user) => users.push(user)
};
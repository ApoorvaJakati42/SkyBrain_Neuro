const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  sessionId: String,
  sessionName: String,  
  emotions: [] ,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // This should match the name you've used for the User model
  }
});

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;

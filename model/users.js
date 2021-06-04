var mongoose = require('mongoose');  
var blobSchema = new mongoose.Schema({  
  name: String,
  email: String,
  password: String,
});
mongoose.model('User', blobSchema);
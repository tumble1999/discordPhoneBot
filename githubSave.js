const Github = require('github-api');
const path = require('path');

var lastData = [];

var github = new Github({
  token: process.env.OAUTH_TOKEN || require('./config/githubOauth.js').token,
  auth: "oauth"
});


var repo = github.getRepo("tumble1999", "discordPhoneBot");

var options = {
  author: {name: 'HerokuSave', email: 'api@tumblenet.ga'},
  committer: {name: 'TN Phones', email: 'admin@tumblenet.ga'},
  encode: true // Whether to base64 encode the file. (default: true)
}

function SavePhones(data, cb) {
  var callback = cb || function (err) {
    console.log(err);
  }
  if (JSON.stringify(lastData, null, '\t') == JSON.stringify(data, null, '\t')) {
    callback("phones is already up to date")
  } else {
    lastData = data;
    repo.writeFile('master', 'data/phones.json', JSON.stringify(data, null, '\t'), 'Update Phones feed', options,
    function(error,request,result) {
      callback(error ? "There was an error in updateing phones data" : "phones data was updated");
    })
  }
}

module.exports = {
  SavePhones:SavePhones
};

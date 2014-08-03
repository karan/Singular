
/*
 * GET home page.
 */

var config = require('./../config.json');

exports.index = function(req, res){
  res.render('index', { api: config.maps });
};

var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var calories = 0;

/* Render Login Page */
router.get('/', function(req, res){
    res.render('Login_Page');
})

/* Login request */
router.post('/', function(req, res){
    var l_username = req.body.l_username;
    var l_password = req.body.l_password;
    var admin = 'yes'
    con.query('SELECT * FROM users WHERE name = ? AND password = ? ', [l_username, l_password], function(err, result){
        if(result.length > 0){
            req.session.loggedin = true;
            req.session.l_username = l_username;
            console.log(result);
        } else {
           console.log("Nop");
        }
        if(err) throw err
    })
    con.query('SELECT * FROM users WHERE name = ? AND isadmin = ?',[l_username, admin], function(err,result){
        if(err) throw err
        if(result.length == 0){
            req.session.isadmin = false;
            res.redirect('/home');
        } else {
            req.session.isadmin = true;
            res.redirect('/home');
        }
    })
});

/* Render register page  */
router.get('/register', function(req, res, next) {
    res.render('Register_Page');
  });


/* Register request */
router.post('/register', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var admin = "no";
    if(username != undefined && password !=undefined){
    con.query('INSERT INTO calendar(person_name,event_date,calories) VALUES(?,?,?)',[username,today,calories],function(err, result){
        if(err) throw err
        console.log("created");
    });
    con.query("INSERT INTO users (name, password, IsAdmin) VALUES(?,?,?)",[username, password, admin], function(err, result){
      if(err) throw err
      console.log("User: " + username + " with the password: " + password + " was inserted into the database. Admin :" + admin);
      res.redirect('/');
    })
  }
  })

  module.exports = router;

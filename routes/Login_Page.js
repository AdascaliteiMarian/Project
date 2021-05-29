var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');
var da = 1;

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var calories = 0;
var wrong;;
var wrong_register;

/* Render Login Page */
router.get('/', function(req, res){
    res.render('Login_Page',{wrong});
})

/* Login request */
router.post('/', function(req, res){
    var login_req_result
    var l_username = req.body.l_username;
    var l_password = req.body.l_password;
    var admin = 'yes'
    con.query('SELECT  name, password FROM users WHERE name = ? AND password = ? ', [l_username, l_password], function(err, result){
        login_req_result = result.length;
        console.log(login_req_result)
    })
    setTimeout(() => {
        if(login_req_result == 1){
            req.session.loggedin = true;
            req.session.l_username = l_username;
            
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
        } else {
            wrong= "Incorrect Username Or Password"
            res.redirect('/')
        }
      }, 1000)
    
});

/* Render register page  */
router.get('/register', function(req, res, next) {
    res.render('Register_Page',{wrong_register});
  });


/* Register request */
router.post('/register', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var admin = "no";
    if(username != undefined && password !=undefined){
    con.query("INSERT INTO users (name, password, IsAdmin) VALUES(?,?,?)",[username, password, admin], function(err, result){
      if(err){
          wrong_register="Username already in use"
          res.redirect('/register')
    } else {
    con.query('INSERT INTO calendar(person_name,event_date,calories) VALUES(?,?,?)',[username,today,calories],function(err, result){
        if(err) throw err
        console.log("created");
    });
      console.log("User: " + username + " with the password: " + password + " was inserted into the database. Admin :" + admin);
      res.redirect('/');
      }
    })
  }
  })

  module.exports = router;

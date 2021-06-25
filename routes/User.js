var express = require('express')
var router = express.Router();
var con = require("../DataBase_Config");
var foods = require("../db//food-db/food.js")
var user = require("../db/user-db/user.js")
var USER_NAME;

var calories = 0;
var wrong_login;
var wrong_register;

/* Render Login Page */
router.get("/", function (req, res) {
  res.render("Login_Page", { wrong_login });
});

/* Login request */
router.post("/", function (req, res) {
  var login_req_result = 0;
  var l_username = req.body.l_username;
  var l_password = req.body.l_password;
  USER_NAME = l_username;
  var admin = "yes";
  async function login(){
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({ 
      multipleStatements: true,
      host: "localhost",
      user: "root",
      password: "password",
      database: "accounts" 
    });
    login_req_result = await conn.execute("SELECT name, password FROM users WHERE name = ? AND password = ? ",
      [l_username, l_password],)
      console.log(login_req_result[0].length)
      console.log(login_req_result[0])
    await conn.end();
  }
  login().then(
    (onResolved) => {
      login1()
    }
  );
  function login1(){
    console.log(login_req_result.length + " inainte")
    if (login_req_result[0].length == 1) {
      console.log(login_req_result.length + "loggedin")
      req.session.loggedin = true;
      req.session.l_username = l_username;
      con.query(
        "SELECT * FROM users WHERE name = ? AND isadmin = ?",
        [l_username, admin],
        function (err, result) {
          if (err) throw err;
          if (result.length == 0) {
            req.session.isadmin = false;
            res.redirect("/food");
          } else {
            req.session.isadmin = true;
            res.redirect("/food");
          }
        }
      );
    } else {
      wrong_login = "Wrong Username or Password"
      res.redirect('/')
    }
  }
})

/* Logout Request */
router.post("/logout", function (req, res) {
  req.session.destroy(function () {});
  res.redirect("/");
}); /* Logout Request */

/* Render register page  */
router.get("/register", function (req, res, next) {
  res.render("Register_Page", { wrong_register });
});

/* Register request */
router.post("/register", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var admin = "no";
  if (username != undefined && password != undefined) {
    con.query(
      "INSERT INTO users (name, password, IsAdmin) VALUES(?, ?, ?)",
      [username, password, admin],
      function (err, result) {
        if (err) {
          wrong_register = "Username already in use";
          res.redirect("/register");
        } else {
          con.query(
            "INSERT INTO calendar(person_name, event_date, calories) VALUES(?, ?, ?)",
            [username, today, calories],
            function (err, result) {
              if (err) throw err;
            }
          );
          console.log(
            "User: " +
              username +
              " with the password: " +
              password +
              " was inserted into the database. Admin :" +
              admin
          );
          res.redirect("/");
        }
      }
    );
  }
});

/* User info */
var phone;
var address;
var last_meals = new Array();
var title;
var email;
var github;
var facebook;
var instagram;
var twitter;

var graph_labels = new Array();
var calories_on_date = 0;
var graph = new Array();
for (var i = 0; i < 7; ++i) {
  graph_labels[i] = "No date registered";
}

/* Render the user profile/graph dates */
var copiedFood;
var all_food_names = new Array();
var calories_counted = 0;
var count = 0;
router.get("/user-profile", function (req, res) {
  con.query(
    "SELECT * FROM users WHERE name = ?",
    [USER_NAME],
    function (err, result) {
      title = result[0].title;
      email = result[0].email;
      github = result[0].github;
      facebook = result[0].facebook;
      instagram = result[0].instagram;
      twitter = result[0].twitter;
      phone = result[0].phone;
      address = result[0].address;
    }
  );
  helper_date = user.helper();
  number_of_entries = user.helper_1();
  graph_labels = user.helper_2();
  var graph_info = user.helper_3();
  last_meals = user.helper_4();
  graph = graph_info.graph;
  last_tracked_date = graph_info.last_tracked_date;
  flag_variable = graph_info.flag_variable;
  if (count > 0) {
    calories_counted = 0;
  }
  count = 0;
  all_food_names = "";
  let result2 = "";
  var result1 = foods.getFood()
    res.render("User_Profile", {
      name: req.session.l_username,
      result1,
      result2,
      last_meals,
      address,
      phone,
      calories_on_date,
      graph,
      graph_labels,
      title,
      email,
      github,
      facebook,
      instagram,
      twitter,
    });
    copiedFood = result1;
});

/* Add up calories and show the food that was added */
router.post("/add-user-calories", function (req, res) {
  var food_name = req.body.example;
  var result1 = copiedFood;
  con.query(
    "SELECT kilocalories FROM foods WHERE foodname= ?",
    [food_name],
    function (err, result2) {
      if (err) throw err;
      if (count == 0) {
        calories_counted = result2[0].kilocalories;
        ++count;
        all_food_names = all_food_names + "  " + food_name;
      } else {
        all_food_names = all_food_names + " + " + food_name;
        calories_counted = calories_counted + result2[0].kilocalories;
      }
      res.render("User_Profile", {
        name: req.session.l_username,
        result1,
        calories_counted,
        all_food_names,
        last_meals,
        address,
        phone,
        calories_on_date,
        graph,
        graph_labels,
        title,
        email,
        github,
        facebook,
        instagram,
        twitter,
      });
    }
  );
});
/* Show calories consumed */
router.post("/user-consumed", function (req, res) {
  user.helper_5();
  res.redirect("/user-profile");
});

/* Show calories on date */
router.post("/search-user-calories", function (req, res) {
  var calendar_date = req.body.calendar_date;
  con.query(
    "SELECT calories FROM calendar WHERE person_name = ? AND event_date = ?",
    [USER_NAME, calendar_date],
    function (err, result) {
      if (err) throw err;
      if (result != "") {
        calories_on_date = result[0].calories;
      } else {
        calories_on_date = 0;
      }
      res.redirect("/user-profile");
    }
  );
});

/* Render Settings page */
router.get("/settings", function (req, res) {
  res.render("settings", { name: USER_NAME, address, title });
});

/* Change user info  */
router.post("/change-user-info", function (req, res) {
  var array_user_info = new Array();
  array_user_info[0] = req.body.title;
  array_user_info[1] = req.body.email;
  array_user_info[2] = req.body.phone;
  array_user_info[3] = req.body.address;
  array_user_info[4] = req.body.github;
  array_user_info[5] = req.body.instagram;
  array_user_info[6] = req.body.facebook;
  array_user_info[7] = req.body.twitter;
  var all_querys = new Array();
  all_querys[0] = "UPDATE users SET title = ? WHERE name = ?";
  all_querys[1] = "UPDATE users SET email = ? WHERE name = ?";
  all_querys[2] = "UPDATE users SET phone = ? WHERE name = ?";
  all_querys[3] = "UPDATE users SET address = ? WHERE name = ?";
  all_querys[4] = "UPDATE users SET github = ? WHERE name = ?";
  all_querys[5] = "UPDATE users SET instagram = ? WHERE name = ?";
  all_querys[6] = "UPDATE users SET facebook = ? WHERE name = ?";
  all_querys[7] = "UPDATE users SET twitter = ? WHERE name = ?";
  for (var i = 0; i < array_user_info.length; ++i) {
    if (array_user_info[i] != "") {
      con.query(
        all_querys[i],
        [array_user_info[i], USER_NAME],
        function (err, result) {
          if (err) throw err;
        }
      );
    }
  }
  res.redirect("/user-profile");
});

const user1 = () => {
  return USER_NAME;
}

const caloriesCounted = () => {
  return calories_counted;
}

const allFoods = () => {
  return all_food_names;
}

exports.allFoods = allFoods;
exports.caloriesCounted = caloriesCounted;
exports.user1 = user1;
module.exports = router;
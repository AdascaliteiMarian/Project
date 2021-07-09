var express = require("express");
var router = express.Router();
var con = require("../DataBase_Config");
var foods = require("../db/food-db/food.js");
var user = require("../db/user-db/user.js");
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
  async function login() {
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      multipleStatements: true,
      host: "localhost",
      user: "root",
      password: "password",
      database: "accounts",
    });
    login_req_result = await conn.execute(
      "SELECT name, password FROM users WHERE name = ? AND password = ? ",
      [l_username, l_password]
    );
    await conn.end();
  }
  login().then(() => {
    resultCheck();
  });
  function resultCheck() {
    if (login_req_result[0].length == 1) {
      req.session.loggedin = true;
      user.getUserInfo();
      helper_date = user.helper();
      number_of_entries = user.getNumberOfEntries();
      graph_labels = user.getGraphLabels();
      var graph_info = user.getGraphInfo();
      last_meals = user.getLastMeals();
      graph = graph_info.graph;
      last_tracked_date = graph_info.last_tracked_date;
      flag_variable = graph_info.flag_variable;
      res.redirect("/food");
    } else {
      wrong_login = "Wrong Username or Password";
      res.redirect("/");
    }
  }
});

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
    if (user.registerUser(username, password, admin, calories) == 0) {
      wrong_register = "Username already in use";
      res.redirect("/register");
    } else {
      res.redirect("/");
    }
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
  user.getUserInfo();
  helper_date = user.helper();
  number_of_entries = user.getNumberOfEntries();
  graph_labels = user.getGraphLabels();
  var graph_info = user.getGraphInfo();
  last_meals = user.getLastMeals();
  graph = graph_info.graph;
  last_tracked_date = graph_info.last_tracked_date;
  flag_variable = graph_info.flag_variable;
  if (count > 0) {
    calories_counted = 0;
  }
  count = 0;
  all_food_names = "";

  let result2 = "";
  var result1 = foods.getFood();
  var userinfo = user.getInfo();
  title = userinfo.title;
  address = userinfo.address;
  facebook = userinfo.facebook;
  instagram = userinfo.instagram;
  twitter = userinfo.twitter;
  github = userinfo.github;
  email = userinfo.email;
  phone = userinfo.phone;
  res.render("User_Profile", {
    name: USER_NAME,
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
  var food_calories = user.getSelectedCalories(food_name);
  food_calories.then((result) => {
    console.log(result);
    if (count == 0) {
      calories_counted = result;
      ++count;
      all_food_names = all_food_names + "  " + food_name;
    } else {
      all_food_names = all_food_names + " + " + food_name;
      calories_counted = calories_counted + result;
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
  });
});
/* Show calories consumed */
router.post("/user-consumed", function (req, res) {
  user.getupdatedGraph();
  res.redirect("/user-profile");
});

/* Show calories on date */
router.post("/search-user-calories", function (req, res) {
  var calendar_date = req.body.calendar_date;
  var pass_calories = user.showCaloriesOnDate(calendar_date);
  pass_calories.then((param) => {
    calories_on_date = param;
    res.redirect("/user-profile");
  });
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
  user.changeUserInfo(array_user_info);
  res.redirect("/user-profile");
});

const user1 = () => {
  return USER_NAME;
};

const caloriesCounted = () => {
  return calories_counted;
};

const allFoods = () => {
  return all_food_names;
};

exports.allFoods = allFoods;
exports.caloriesCounted = caloriesCounted;
exports.user1 = user1;
module.exports = router;

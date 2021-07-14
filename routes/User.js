var express = require("express");
var router = express.Router();
var foods = require("../db/food-db/food.js");
var user = require("../db/user-db/user");

/* Render Login Page */
router.get("/", function (req, res) {
  if(req.session.wrong_login == false){
    var wrong_login = 'Username or password incorrect'
    res.render("Login_Page", { wrong_login });
  } else {
    res.render("Login_Page", { });
  }
});

/* Login request */
router.post("/", function (req, res) {
  var login_req_result = 0;
  var l_username = req.body.l_username;
  username = l_username;
  var l_password = req.body.l_password;
  login_req_result = user.searchForUser(l_username, l_password);
  login_req_result.then(
    (result) => {
      if (result.length == 1) {
        req.session.loggedin = true;
        req.session.username = l_username;
        res.redirect("/food");
      } else {
        req.session.wrong_login = false;
        res.redirect("/");
      }
    }
  )
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
  var calories = 0;
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

router.get("/user-profile", function (req, res) {
  req.session.copiedFood = foods.getFood();
  req.session.count = 0;
  const graph_labels = new Array();
  for (var i = 0; i < 7; ++i) {
    graph_labels[i] = "No date registered";
  }
  user.getUserInfo(req.session.username);
  user.helper();
  user.getNumberOfEntries(req.session.username);
  if (req.session.count > 0) {
    req.session.calories_counted = 0;
  }
  req.session.count = 0;
  let result2 = "";
  let userinfo = user.getInfo();
  res.render("User_Profile", {
    name: req.session.username,
    result1: req.session.copiedFood,
    result2,
    last_meals: user.getLastMeals(req.session.username),
    address: userinfo.address,
    phone: userinfo.phone,
    calories_on_date: req.session.calories_on_date,
    graph: user.getGraphInfo(req.session.username),
    graph_labels: user.getGraphLabels(req.session.username),
    title: userinfo.title,
    email: userinfo.email,
    github: userinfo.github,
    facebook: userinfo.facebook,
    instagram: userinfo.instagram,
    twitter:userinfo.twitter,
  });
  req.session.copiedFood = result1;
});

/* Add up calories and show the food that was added */
router.post("/add-user-calories", function (req, res) {
  req.session.all_food_names = new Array();
  const graph_labels = new Array();
  for (var i = 0; i < 7; ++i) {
    graph_labels[i] = "No date registered";
  }
  let userinfo = user.getInfo();
  var food_name = req.body.example;
  var food_calories = user.getSelectedCalories(food_name);
  food_calories.then((result) => {
    if (req.session.count == 0) {
      req.session.calories_counted = result;
      ++req.session.count;
      req.session.all_food_names = req.session.all_food_names + "  " + food_name;
    } else {
      req.session.all_food_names = req.session.all_food_names + " + " + food_name;
      req.session.calories_counted = req.session.calories_counted + result;
    }
    res.render("User_Profile", {
      name: req.session.l_username,
      result1: req.session.copiedFood,
      calories_counted: req.session.calories_counted,
      all_food_names: req.session.all_food_names,
      last_meals: user.getLastMeals(req.session.username),
      address: userinfo.address,
      phone: userinfo.phone,
      calories_on_date: req.session.calories_on_date,
      graph: user.getGraphInfo(req.session.username),
      graph_labels: user.getGraphLabels(req.session.username),
      title: userinfo.title,
      email: userinfo.email,
      github: userinfo.github,
      facebook: userinfo.facebook,
      instagram: userinfo.instagram,
      twitter: userinfo.twitter,
    });
  });
});
/* Show calories consumed */
router.post("/user-consumed", function (req, res) {
  user.getupdatedGraph(req.session.username, req.session.calories_counted, req.session.all_food_names);
  res.redirect("/user-profile");
});

/* Show calories on date */
router.post("/search-user-calories", function (req, res) {
  var calendar_date = req.body.calendar_date;
  var pass_calories = user.showCaloriesOnDate(calendar_date, req.session.username);
  pass_calories.then((param) => {
    req.session.calories_on_date = param;
    res.redirect("/user-profile");
  });
});

/* Render Settings page */
router.get("/settings", function (req, res) {
  let userinfo = user.getInfo();
  res.render("settings", { name: req.session.l_username, address: userinfo.address, title: userinfo.title});
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
  user.changeUserInfo(array_user_info, req.session.username);
  res.redirect("/user-profile");
});

module.exports = router;

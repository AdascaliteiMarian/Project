const express = require("express");
const router = express.Router();
const foods = require("../db/food-db/food.js");

/* Render Home page */
router.get("/", function (req, res) {
  req.session.warning_not_admin = "";
  if (req.session.loggedin) {
    res.render("Home_Page", { warning_not_admin: req.session.warning_not_admin });
  } else {
    res.set("Content-Type", "text/plain");
  }
});

/* Render Food List */
router.get("/list", function (req, res) {
  let all_foods = foods.getFood();
  res.render("food_list", { all_foods });
});

/* Add food to DB */
router.post("/add", function (req, res) {
  req.session.letters_instead = "U wrote letter where they are not supposed to go"
  if (req.session.isadmin == true) {
    let foodname = req.body.foodname;
    let kilocalories = req.body.kilocalories;
    let proteins = req.body.proteins;
    let lipid = req.body.lipid;
    let carbohydrates = req.body.carbohydrates;
    let water = req.body.water;
    let comment = req.body.comment;
    if (
      foodname == "" ||
      kilocalories == "" ||
      water == "" ||
      carbohydrates == "" ||
      lipid == "" ||
      proteins == ""
    ) {
      let warning_inputs = "You have to fill every input";
      res.render("Home_Page", { warning_inputs });
    } else {
      if (
        foods.insertFood(
          foodname,
          kilocalories,
          proteins,
          lipid,
          carbohydrates,
          water,
          comment
        ) != 0
      ) {
      } else {
        res.render("Home_Page", { letters_instead: req.session.letters_instead });
      }
    }
    res.redirect("/food/list");
  } else {
    req.session.warning_not_admin = "You are not an admin to be able to insert foods";
    res.redirect("/food");
  }
});

/* Sort Food List by Alphabetical Order */
router.get("/sort-alpha", function (req, res) {
  let all_foods = foods.sortFoodAlph();
  res.render("food_list", { all_foods });
});

/* Sort Food List by number of least Calories*/
router.get("/sort-by-least-calories", function (req, res) {
  let all_foods = foods.sortFoodByCalories();
  res.render("food_list", { all_foods });
});

/* Sort Food List by number of most Calories*/
router.get("/sort-by-most-calories", function (req, res) {
  let all_foods = foods.sortFoodByLeastCalories();
  res.render("food_list", { all_foods });
});

module.exports = router;

const con = require("../../DataBase_Config");
let food;
let food_sorted_alph;
let food_sorted_by_calories;
let food_sorted_by_least_calories;

con.query("SELECT * FROM foods", function (err, result) {
  food = result;
});

con.query("SELECT * FROM foods ORDER BY foodname", function (err, result) {
  food_sorted_alph = result;
});

con.query("SELECT * FROM foods ORDER BY kilocalories", function (err, result) {
  food_sorted_by_calories = result;
});

con.query(
  "SELECT * FROM foods ORDER BY kilocalories DESC",
  function (err, result) {
    food_sorted_by_least_calories = result;
  }
);

const insertFood = (
  foodname,
  kilocalories,
  proteins,
  lipid,
  carbohydrates,
  water,
  comment
) => {
  con.query(
    "INSERT INTO foods(foodname, kilocalories, proteins, lipid, carbohydrates, water, comment) VALUES(?, ?, ?, ?, ?, ?, ?)",
    [foodname, kilocalories, proteins, lipid, carbohydrates, water, comment],
    function (err, result) {
      if (err) {
        return 0;
      } else {
        console.log("food inserted");
      }
    }
  );
};

const getFood = () => {
  return food;
};

const sortFoodAlph = () => {
  return food_sorted_alph;
};

const sortFoodByCalories = () => {
  return food_sorted_by_calories;
};

const sortFoodByLeastCalories = () => {
  return food_sorted_by_least_calories;
};

exports.getFood = getFood;
exports.sortFoodAlph = sortFoodAlph;
exports.sortFoodByCalories = sortFoodByCalories;
exports.sortFoodByLeastCalories = sortFoodByLeastCalories;
exports.insertFood = insertFood;

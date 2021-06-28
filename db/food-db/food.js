var con = require("../../DataBase_Config");
var food;
var food_sorted_alph;
var food_sorted_by_calories;
var food_sorted_by_least_calories;


con.query("SELECT * FROM foods", function (err, result) {
    food = result;
})

con.query("SELECT * FROM foods ORDER BY foodname", function (err, result) {
    food_sorted_alph = result;
});

con.query("SELECT * FROM foods ORDER BY kilocalories", function (err, result) {
    food_sorted_by_calories = result
});

con.query("SELECT * FROM foods ORDER BY kilocalories DESC", function (err, result) {
    food_sorted_by_least_calories = result;
});

const getFood = () => {
    return food;
}

const sortFoodAlph = () => {
    return food_sorted_alph;
}

const sortFoodByCalories = () => {
    return food_sorted_by_calories;
}

const sortFoodByLeastCalories = () => {
    return food_sorted_by_least_calories;
}

exports.getFood = getFood;
exports.sortFoodAlph = sortFoodAlph;
exports.sortFoodByCalories = sortFoodByCalories;
exports.sortFoodByLeastCalories = sortFoodByLeastCalories;







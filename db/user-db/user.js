const { InsufficientStorage } = require("http-errors");
var con = require("../../DataBase_Config");
var user1 = require("../../routes/User");
var helper_date = 0;
var number_of_entries = 0;
var graph = new Array();
var last_tracked_date;
var flag_variable = 0;
var last_meals = new Array();
var all_food_names = new Array();
var calories_counted = 0;
var graph_labels = new Array();
var d = new Date();
var days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var dayName = days[d.getDay()];
const monthName = new Date();
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();
today = yyyy + "-" + mm + "-" + dd;
var labels_for_graph =
  dayName + " " + monthNames[monthName.getMonth()] + " " + dd;

const helper = () => {
  con.query(
    "INSERT INTO helper(yesterday) VALUES(?)",
    [today],
    function (err, result) {
      if (err) throw err;
    }
  );
  con.query(
    "SELECT * FROM helper ORDER BY yesterday DESC",
    [today],
    function (err, result) {
      if (err) throw err;
      helper_date = result[0].yesterday;
    }
  );
  return helper_date;
};

const helper1 = () => {
  con.query(
    "SELECT COUNT(event_date) as cnt FROM calendar WHERE person_name = ?",
    [USER_NAME],
    function (err, result) {
      if (err) throw err;
      number_of_entries = result[0].cnt;
    }
  );
  return number_of_entries;
};

const helper2 = () => {
  con.query(
    "SELECT graph_label_date FROM calendar WHERE person_name = ? ORDER BY event_date DESC",
    [USER_NAME],
    function (err, result) {
      for (var i = 0; i < number_of_entries; ++i) {
        if (result[i] != " " || number_of_entries > 0) {
          graph_labels[i] = result[i].graph_label_date;
        } else {
          graph_labels[i] = "No date registered";
        }
      }
    }
  );
  return graph_labels;
};

const helper3 = () => {
  con.query(
    "SELECT * FROM calendar WHERE person_name = ? ORDER BY event_date DESC",
    [USER_NAME],
    function (err, result) {
      if (err) throw err;
      for (var i = 0; i < number_of_entries; ++i) {
        if (result[i].calories != " ") {
          graph[i] = result[i].calories;
        } else {
          graph[i] = 0;
        }
      }
      last_tracked_date = result[0].event_date;
      if (helper_date.toString() == last_tracked_date.toString()) {
        flag_variable = 1;
      }
    }
  );
  var graph_helper = {
    graph: graph,
    last_tracked_date: last_tracked_date,
    flag_variable: flag_variable,
  };
  return graph_helper;
};

const helper4 = () => {
  con.query(
    "SELECT * FROM users WHERE name = ?",
    [user1.user1()],
    function (err, result) {
      last_meals = result[0].Consumed;
    }
  );
  return last_meals;
};

const helper5 = () => {
  calories_counted = user1.caloriesCounted();
  all_food_names = user1.allFoods();
  con.query(
    "UPDATE users SET consumed = ? WHERE Name = ?",
    [all_food_names, user1.user1()],
    function (err, result) {
      if (err) throw err;
    }
  );
  if (flag_variable == 0) {
    con.query(
      "INSERT INTO calendar(person_name, event_date, calories, graph_label_date) VALUES(?, ?, ?, ?)",
      [user1.user1(), today, calories_counted, labels_for_graph],
      function (err, result) {
        if (err) throw err;
      }
    );
  } else {
    con.query(
      "DELETE FROM calendar WHERE event_date = ? AND person_name = ? ",
      [today, user1.user1()],
      function (err, result) {
        if (err) throw err;
      }
    );
    con.query(
      "INSERT INTO calendar(person_name, event_date, calories, graph_label_date) VALUES(?, ?, ?, ?)",
      [user1.user1(), today, calories_counted, labels_for_graph],
      function (err, result) {
        if (err) throw err;
      }
    );
  }
};

exports.helper = helper;
exports.helper1 = helper1;
exports.helper2 = helper2;
exports.helper3 = helper3;
exports.helper4 = helper4;
exports.helper5 = helper5;

const { InsufficientStorage } = require("http-errors");
var con = require("../../DataBase_Config");
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
var info = {
  title: "",
  email: "",
  github: "",
  facebook: "",
  instagram: "",
  twitter: "",
  phone: "",
  address: "",
};
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

const getNumberOfEntries = (username) => {
  con.query(
    "SELECT COUNT(event_date) as cnt FROM calendar WHERE person_name = ?",
    [username],
    function (err, result) {
      if (err) throw err;
      number_of_entries = result[0].cnt;
    }
  );
};

const getGraphLabels = (username) => {
  con.query(
    "SELECT graph_label_date FROM calendar WHERE person_name = ? ORDER BY event_date DESC",
    [username],
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

const getGraphInfo = (username) => {
  con.query(
    "SELECT * FROM calendar WHERE person_name = ? ORDER BY event_date DESC",
    [username],
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

  return graph;
};

const getLastMeals = (username) => {
  con.query(
    "SELECT * FROM users WHERE name = ?",
    [username],
    function (err, result) {
      last_meals = result[0].Consumed;
    }
  );
  return last_meals;
};

const getupdatedGraph = (username, calories_counted, all_food_names) => {
  con.query(
    "UPDATE users SET consumed = ? WHERE Name = ?",
    [all_food_names, username],
    function (err, result) {
      if (err) throw err;
    }
  );
  if (flag_variable == 0) {
    con.query(
      "INSERT INTO calendar(person_name, event_date, calories, graph_label_date) VALUES(?, ?, ?, ?)",
      [username, today, calories_counted, labels_for_graph],
      function (err, result) {
        if (err) throw err;
      }
    );
  } else {
    con.query(
      "DELETE FROM calendar WHERE event_date = ? AND person_name = ? ",
      [today, username],
      function (err, result) {
        if (err) throw err;
      }
    );
    con.query(
      "INSERT INTO calendar(person_name, event_date, calories, graph_label_date) VALUES(?, ?, ?, ?)",
      [username, today, calories_counted, labels_for_graph],
      function (err, result) {
        if (err) throw err;
      }
    );
  }
};

const registerUser = (username, password, admin, calories) => {
  con.query(
    "INSERT INTO users (name, password, IsAdmin) VALUES(?, ?, ?)",
    [username, password, admin],
    function (err, result) {
      if (err) {
        return 0;
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
      }
    }
  );
};

const getUserInfo = (username) => {
  async function selectInfo() {
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      multipleStatements: true,
      host: "localhost",
      user: "root",
      password: "password",
      database: "accounts",
    });
    result = await conn.execute("SELECT * FROM users WHERE name = ?", [
      username,
    ]);
    var usertitle = result[0];
    info.title = usertitle[0].title;
    info.address = usertitle[0].address;
    info.phone = usertitle[0].phone;
    info.github = usertitle[0].github;
    info.facebook = usertitle[0].facebook;
    info.twitter = usertitle[0].twitter;
    info.instagram = usertitle[0].instagram;
    info.email = usertitle[0].email;
    await conn.end();
  }
  selectInfo();
};

const getInfo = () => {
  return info;
};

const getSelectedCalories = (food_name) => {
  return new Promise(function (resolve, reject) {
    con.query(
      "SELECT kilocalories FROM foods WHERE foodname= ?",
      [food_name],
      function (err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result[0].kilocalories);
      }
    );
  });
};

const changeUserInfo = (array_user_info,username) => {
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
        [array_user_info[i], username],
        function (err, result) {
          if (err) throw err;
        }
      );
    }
  }
};

const showCaloriesOnDate = (calendar_date,username) => {
  return new Promise(function (resolve, reject) {
    var calories_on_date = 0;
    con.query(
      "SELECT calories FROM calendar WHERE person_name = ? AND event_date = ?",
      [username, calendar_date],
      function (err, result) {
        if (err) {
          reject(err);
        }
        if (result != "") {
          calories_on_date = result[0].calories;
        } else {
          calories_on_date = 0;
        }
        resolve(calories_on_date);
      }
    );
  });
};

const searchForUser = (l_username, l_password) => {
  return new Promise(function (resolve, reject){
    con.query( "SELECT name, password FROM users WHERE name = ? AND password = ? ",
    [l_username, l_password],
    function (err, result) {
      if(err) {
        reject(err);
      }
      resolve(result);
    }
    );
  })
}

exports.helper = helper;
exports.getNumberOfEntries = getNumberOfEntries;
exports.getGraphLabels = getGraphLabels;
exports.getGraphInfo = getGraphInfo;
exports.getLastMeals = getLastMeals;
exports.getupdatedGraph = getupdatedGraph;
exports.registerUser = registerUser;
exports.getUserInfo = getUserInfo;
exports.getInfo = getInfo;
exports.getSelectedCalories = getSelectedCalories;
exports.changeUserInfo = changeUserInfo;
exports.showCaloriesOnDate = showCaloriesOnDate;
exports.searchForUser = searchForUser;

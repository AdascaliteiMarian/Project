const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "accounts",
});



con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database");
});

module.exports = con;

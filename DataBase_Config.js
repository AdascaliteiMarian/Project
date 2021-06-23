var mysql = require('mysql')

var con = mysql.createConnection({
  multipleStatements: true,
  host: "localhost",
  user: "root",
  password: "password",
  database: "accounts"
});

con.connect(function(err){
  if(err) throw err
  console.log("Connected to database");
})


module.exports = con;

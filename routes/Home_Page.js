const { json } = require('body-parser');
var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');
var calories;
var count = 0;

/* Render Home page */
router.get('/', function(req, res){
    if(req.session.loggedin){
        res.render('Home_Page');
    } else {
        res.set('Content-Type', 'text/plain')
    }
})
/* Logout Request */
 router.post('/', function(req, res){
     req.session.destroy(function(){
         console.log('User logged out');
     })
     res.redirect('/');
 })

 /* Add food to DB */
 router.post('/addfood' ,function(req, res){
    if(req.session.isadmin == true){
        let foodname = req.body.foodname;
        let kilocalories = req.body.kilocalories;
        let proteins = req.body.proteins;
        let lipid = req.body.lipid;
        let carbohydrates = req.body.carbohydrates
        let water = req.body.water;
        let comment = req.body.comment;
        con.query('INSERT INTO foods(foodname,kilocalories, proteins,lipid,carbohydrates,water,comment) VALUES(?,?,?,?,?,?,?)',[foodname,kilocalories,proteins,lipid,carbohydrates,water,comment], function(err, result){
            if(err) throw err
            console.log("Food : " + foodname + " was added" );
    })
    } else {
        console.log(req.session.isadmin);
        res.send("You are not an admin to be able to insert foods");
    }
 })

/* Render Food List */
 router.get('/foodlist', function(req, res){
    con.query('SELECT * FROM foods', function(err, result){
        res.render('food_list', {result});
    })
 })
/* Sort Food List by Alphabetical Order */
 router.get('/sortAlpha',function(req, res){
     con.query('SELECT * FROM foods ORDER BY foodname', function(err, result){
         res.render('food_list',{result});
         console.log("List sorted Alphabetically");
     })
 })
/* Sort Food List by number of least Calories*/
 router.get('/sortByCalories',function(req, res){
    con.query('SELECT * FROM foods ORDER BY kilocalories', function(err, result){
        res.render('food_list',{result});
        console.log("List sorted by number of calories");
    })
})

router.post('/change_comment?:id',function(req, res){
    let id = req.query.id
    let comment = req.body.commentchange;
    con.query('UPDATE foods SET comment=? WHERE(id=?)',[comment, id], function(err, result){
        if(err) throw err;
        console.log("Comment changed at id: " +id);
        res.redirect('/home/foodlist');
    })
})
var da;
var x = new Array();
router.get('/User_Profile', function(req, res){
    if(count > 0){
        calories = 0;
    }
    x = "";
    let result2="";
    con.query('SELECT * FROM foods ORDER BY foodname', function(err, result1){
        res.render('User_Profile', {name: req.session.l_username, result1, result2});
        da = result1;
    })
})
router.post('/add_calories', function(req, res){
    var food_name = req.body.example;
    console.log(food_name)
    var result1 = da;
    con.query('SELECT kilocalories FROM foods WHERE foodname= ?',[food_name], function(err, result2){
        if(err) throw err
        if(count == 0){
            calories = result2[0].kilocalories;
            ++count;
            x = x + "  " + food_name;
        } else {
            x = x + " + " + food_name;
            calories = calories + result2[0].kilocalories;
        }
        res.render('User_Profile', {name: req.session.l_username, result1, calories, x});
    })
})
module.exports = router;
var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');

/* Render Home page */
var warning_not_admin;
router.get('/', function(req, res){
    if(req.session.loggedin){
        USER_NAME = req.session.l_username;
        res.render('Home_Page', {warning_not_admin});
    } else {
        res.set('Content-Type', 'text/plain')
    }
})

/* Logout Request */
 router.post('/', function(req, res){
     req.session.destroy(function(){
     })
     res.redirect('/');
 })

 /* Render Food List */
 router.get('/list', function(req, res){
    con.query('SELECT * FROM foods', function(err, result){
        res.render('food_list', {result});
    })
 })

 /* Add food to DB */
 var letters_instead='U wrote letters where they are not supposed to go';
 router.post('/add' ,function(req, res){
    if(req.session.isadmin == true){
        let foodname = req.body.foodname;
        let kilocalories = req.body.kilocalories;
        let proteins = req.body.proteins;
        let lipid = req.body.lipid;
        let carbohydrates = req.body.carbohydrates
        let water = req.body.water;
        let comment = req.body.comment;
        if(foodname == '' || kilocalories == '' || water == '' || carbohydrates == '' || lipid == '' || proteins == ''){
            let warning_inputs = 'You have to fill every input'
            res.render('Home_Page', {warning_inputs});
        } else {
            con.query('INSERT INTO foods(foodname, kilocalories, proteins, lipid, carbohydrates, water, comment) VALUES(?, ?, ?, ?, ?, ?, ?)', [foodname, kilocalories, proteins, lipid, carbohydrates, water, comment], function(err, result){
                if(err) {
                    res.render('Home_Page', {letters_instead});
                }
            })
        }
    res.redirect('/food/list')
    } else {
        warning_not_admin = "You are not an admin to be able to insert foods";
        res.redirect('/food')
    }
 })

/* Sort Food List by Alphabetical Order */
 router.get('/sort-alpha', function(req, res){
     con.query('SELECT * FROM foods ORDER BY foodname', function(err, result){
         res.render('food_list', {result});
         console.log("List sorted Alphabetically");
     })
 })

/* Sort Food List by number of least Calories*/
 router.get('/sort-by-least-calories', function(req, res){
    con.query('SELECT * FROM foods ORDER BY kilocalories', function(err, result){
        res.render('food_list', {result});
        console.log("List sorted by number of calories");
    })
})

/* Sort Food List by number of most Calories*/
router.get('/sort-by-most-calories', function(req, res){
    con.query('SELECT * FROM foods ORDER BY kilocalories DESC', function(err, result){
        res.render('food_list', {result});
        console.log("List sorted by number of calories");
    })
})

module.exports = router;

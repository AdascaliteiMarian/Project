var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');

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
        let kilocaries = req.body.kilocalories;
        let proteins = req.body.proteins;
        let lipid = req.body.lipid;
        let carbohydrates = req.body.carbohydrates
        let water = req.body.water;
        let comment = req.body.comment;
        con.query('INSERT INTO foods(foodname,kilocalories, proteins,lipid,carbohydrates,water,comment) VALUES(?,?,?,?,?,?,?)',[foodname,kilocaries,proteins,lipid,carbohydrates,water,comment], function(err, result){
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
router.get('/User_Profile', function(req, res){
    con.query('SELECT * FROM foods ORDER BY foodname', function(err, result1){
        res.render('User_Profile', {name: req.session.l_username, result1});
        console.log(req.session.l_username);
    })
})

router.post('/add_calories', function(req, res){
    let food_name = req.body.food_name;
    con.query('SELECT kilocalories FROM foods WHERE foodname= ?',[food_name], function(err, result2){
        res.render('User_Profile', {name: req.session.l_username, result2});
    })
})

module.exports = router;
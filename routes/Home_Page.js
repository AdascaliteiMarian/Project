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
     var id = req.params.id;
    con.query('SELECT * FROM foods', function(err, result){
        res.render('food_list', {result, id});
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

router.post('/changecomment/:id',function(req, res){
    var id = req.params.id
    console.log(id);
})


 module.exports = router;
var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');

router.get('/', function(req, res){
    if(req.session.loggedin){
        res.render('Home_Page');
    } else {
        res.send("INcorrect username or password");
    }
})

 router.post('/', function(req, res){
     req.session.destroy(function(){
         console.log('User logged out');
     })
     res.redirect('/login');
 })

 router.post('/food' ,function(req, res){
    if(req.session.isadmin == true){
        var foodname = req.body.foodname;
        var kilocaries = req.body.kilocalories;
        var proteins = req.body.proteins;
        var lipid = req.body.lipid;
        var carbohydrates = req.body.carbohydrates
        var water = req.body.water;
        con.query('INSERT INTO foods(foodname,kilocalories, proteins,lipid,carbohydrates,water) VALUES(?,?,?,?,?,?)',[foodname,kilocaries,proteins,lipid,carbohydrates,water], function(err, result){
            if(err) throw err
            console.log("Food : " + foodname + "was added" );
    })
    } else {
        console.log(req.session.isadmin);
        res.send("You are not an admin to be able to insert foods");
    }
 })


 module.exports = router;
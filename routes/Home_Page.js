var express = require('express');
var router = express.Router();
var con = require('../DataBase_Config');
var calories = 0;
var count = 0;

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var d = new Date();
var dayName = days[d.getDay()];

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthName = new Date();
var labels_for_graph = dayName + " " + monthNames[monthName.getMonth()] + " " + dd;
console.log(labels_for_graph)


/* Render Home page */
router.get('/', function(req, res){
    if(req.session.loggedin){
        USER_NAME = req.session.l_username;
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
        if(foodname == '' || kilocalories == '' || water == '' || carbohydrates == '' || lipid == '' || proteins == ''){
            console.log('All have to be completed');
            res.send("U have to fill every input");
        } else {
        con.query('INSERT INTO foods(foodname,kilocalories, proteins,lipid,carbohydrates,water,comment) VALUES(?,?,?,?,?,?,?)',[foodname,kilocalories,proteins,lipid,carbohydrates,water,comment], function(err, result){
    })
}
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

var copiedFood;
var all_food_names = new Array();

/* User info */
var phone;
var address;
var last_meals = new Array();
var title;
var USER_NAME;
var email;
var github;
var facebook;
var instagram;
var twitter;


var last_tracked_date = 0;
var helper = 0;
var flag_variable = 0;
var number_of_entries = 0;
var graph_labels = new Array();
var calories_on_date = 0;
var graph = new Array();
for(var i = 0; i < 7; ++i){
    graph_labels[i] = 'No date registered'
}

/* Render the user profile/graph dates */
router.get('/User_Profile', function(req, res){
    con.query('SELECT * FROM users WHERE name = ?',[USER_NAME], function(err,result){
      title = result[0].title;
      email = result[0].email;
      github = result[0].github;
      facebook = result[0].facebook;
      instagram = result[0].instagram;
      twitter = result[0].twitter;
    })
    con.query('SELECT graph_label_date FROM calendar WHERE person_name = ? ORDER BY event_date DESC', [USER_NAME], function(err,result){
        console.log(number_of_entries)
        for(var i = 0; i < number_of_entries; ++i){
            if(result[i] != " " || number_of_entries > 0){
                graph_labels[i] = result[i].graph_label_date;
            } else {
                graph_labels[i] = "No date registered";
            }
        }
    })
    con.query('INSERT INTO helper(yesterday) VALUES(?)',[today], function(err,result){
    })
    con.query('SELECT * FROM helper ORDER BY yesterday DESC',[today], function(err,result){
        helper = result[0].yesterday;
    })
    con.query('SELECT COUNT(event_date) as cnt FROM calendar WHERE person_name = ?', [USER_NAME] , function(err,result){
        number_of_entries = result[0].cnt;
    })
    con.query('SELECT * FROM calendar WHERE person_name = ? ORDER BY event_date DESC',[USER_NAME], function(err, result){
        if(err) throw err
        for(var i = 0; i < number_of_entries; ++i){
            if(result[i].calories != " "){
                graph[i] = result[i].calories;
            } else {
                graph[i] = 0;
            }
        }
        last_tracked_date = result[0].event_date;
        if(helper.toString() == last_tracked_date.toString()){
            flag_variable = 1;
        }
    })
    con.query('SELECT * FROM users WHERE name = ?',[USER_NAME], function(err, result){
        phone = result[0].phone;
        address = result[0].address;
        last_meals = result[0].Consumed;
        console.log(last_meals);
    })
    if(count > 0){
        calories = 0;
    }
    count = 0;
    all_food_names = "";
    let result2="";
    con.query('SELECT * FROM foods ORDER BY foodname', function(err, result1){
        res.render('User_Profile', {name: req.session.l_username, result1, result2,last_meals, address, phone, calories_on_date,graph,graph_labels,title,email,github,facebook,instagram,twitter});
        copiedFood = result1;
    })
})

/* Add up calories and show the food that was added */
router.post('/add_calories', function(req, res){
    var food_name = req.body.example;
    var result1 = copiedFood;
    con.query('SELECT kilocalories FROM foods WHERE foodname= ?',[food_name], function(err, result2){
        if(err) throw err
        if(count == 0){
            calories = result2[0].kilocalories;
            ++count;
            all_food_names = all_food_names + "  " + food_name;
        } else {
            all_food_names = all_food_names + " + " + food_name;
            calories = calories + result2[0].kilocalories;
        }
        res.render('User_Profile', {name: req.session.l_username, result1, calories, all_food_names,last_meals, address, phone,calories_on_date,graph,graph_labels,title,email,github,facebook,instagram,twitter});
    })
})
/* Show calories consumed */
router.post('/consumed', function(req, res){
    console.log(all_food_names);
    con.query('UPDATE users SET consumed = ? WHERE Name = ?',[all_food_names,req.session.l_username],function(err, result){
        if(err) throw err
        console.log("done");
        res.redirect('/home/User_Profile');
    });
    if(flag_variable == 0){
        con.query('INSERT INTO calendar(person_name, event_date, calories,graph_label_date) VALUES(?,?,?,?)',[USER_NAME,today,calories,labels_for_graph],function(err, result){
            if(err) throw err
                console.log("donex2");
    });
    } else {
        con.query('DELETE FROM calendar WHERE event_date = ? AND person_name = ? ',[today,USER_NAME],function(err, result){
            if(err) throw err
                console.log("donex22");
        });
        con.query('INSERT INTO calendar(person_name, event_date, calories,graph_label_date) VALUES(?,?,?,?)',[USER_NAME,today,calories,labels_for_graph],function(err, result){
            if(err) throw err
                console.log("donex2");
    });
}
})

/* Show calories on date */ 
router.post('/set_date_calories', function(req,res){
  var ff = req.body.calendar_date;
  con.query('SELECT calories FROM calendar WHERE person_name = ? AND event_date = ?',[USER_NAME,ff],function(err, result){
      if(err) throw err
    if(result != ""){
    calories_on_date = result[0].calories;
    } else {
        calories_on_date = 0; 
    }
    res.redirect('/home/User_Profile')
});
    console.log(ff);
})

/* Render Settings page */
router.get('/settings', function(req, res){
    res.render('settings',{name: USER_NAME})
})

/* Chnage user info  */
router.post('/change_settings' ,function(req, res){
        let name = req.body.namess
        if(name != ""){
            con.query('UPDATE users SET name = ? WHERE name = ?', [name,USER_NAME],function(err,result){
                if(err) throw err
                console.log('yes name')
            })
        }
        let title = req.body.title
        if(title != ""){
            con.query('UPDATE users SET title = ? WHERE name = ?', [title,USER_NAME],function(err,result){
                if(err) throw err
                console.log('yes title')
            })
        }
        let email = req.body.email
        if(email != ""){
            con.query('UPDATE users SET email = ? WHERE name = ?', [email,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        let phone = req.body.phone
        if(phone != ""){
            con.query('UPDATE users SET phone = ? WHERE name = ?', [phone,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        let address = req.body.address
        if(address != ""){
            con.query('UPDATE users SET address = ? WHERE name = ?', [address,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        let github = req.body.github
        if(github != ""){
            con.query('UPDATE users SET github = ? WHERE name = ?', [github,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        let twitter = req.body.twitter
        if(twitter != ""){
            con.query('UPDATE users SET twitter = ? WHERE name = ?', [twitter,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        let instagram = req.body.instagram
        if(instagram != ""){
            con.query('UPDATE users SET instagram = ? WHERE name = ?', [instagram,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        let facebook = req.body.facebook
        if(facebook != ""){
            con.query('UPDATE users SET facebook = ? WHERE name = ?', [facebook,USER_NAME],function(err,result){
                if(err) throw err
            })
        }
        res.redirect('/home/User_Profile')
})


module.exports = router;
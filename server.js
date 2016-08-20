var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require ("socket.io").listen(server),
	morgan = require("morgan"),
	publicDir = require("path").join(__dirname,"/public"),
	port = 8080,
    handlebars = require("express-handlebars").create({defaultLayout:'main'}),
    bcrypt = require('bcrypt-nodejs'),
    mysql      = require('mysql'),
    session = require('express-session'),
    formidable = require('formidable'),
    fs=require("fs"),
    mkdirp = require('mkdirp'),
    moment = require('moment');

// MySQL connection on mamp pro
try{
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    socketPath: '/srv/run/mysqld/mysqld.sock',
    database : 'squiks'
});
}catch(e){ console.log(e);}

var resources = {
    "bcrypt": bcrypt,
    "connection":connection,
    "moment":moment
}, _assets = null;

// import all my functions
require('./js_modules/functions.js')();

// credentials for security
var credentials = require('./credentials.js');
// content including title and css of each pages
var data = {};

app.use(require('body-parser').urlencoded({extended:true}));
// credentials for security
app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(session({
    resave:false,
    saveUninitialized:true,
    secret:credentials.cookieSecret
}));

//app.use(morgan('dev'));


// import usable files
app.use(express.static(publicDir));
// set a server port
app.set('port',port);

// setup server for form sending infos



// mysql nodejs ?
// var nodeadmin = require('nodeadmin');
// app.use(nodeadmin(app));




app.engine('handlebars',handlebars.engine);
app.set("view engine",'handlebars');

//security reason
app.disable('x-powered-by');
// Start server
server.listen(app.get("port"),function(){
	console.log("Server started on port " + port);
});



app.get("/special-login",function(req,res){
    console.log("ok")
    req.session.connected = true;
    req.session.userID = 70;
    req.session.username = "dwm";
    req.session.profile_picture = "img/users/dwm/dwm.png";
    res.redirect(303, "/home");
});

app.post('/account/:path',function(req,res) {
    var result = req.body,
        user = {
            "email": "",
            "username": "",
            "password": "",
            "profile_picture": "",
            "available":[]
        };
        _assets = {
            "req":req,
            "res":res,
            "resources":resources
        };
    // CREATE AN ACCOUNT
    if(req.params.path == "signup")
    {
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,file){
            if(err) res.redirect(303,"/error");
           else{
                fs.readFile(file.profile_picture.path, function (err, data) {
                    var shortPath = "img/users/"+fields.username.toLowerCase()+"/";
                    var newPath = __dirname +"/public/"+ shortPath;
                    // CREATE PATH
                    mkdirp(newPath, function (err) {
                        if (err) return console.log(err);
                        // INSERT FILE
                        fs.writeFile(newPath+file.profile_picture.name, data, function (err) {
                            if(err) console.log(err);
                        });
                        user.email = fields.email.toLowerCase().replace(/'/g,"\\'");
                        user.username = fields.username.toLowerCase().replace(/'/g,"\\'");
                        user.password = fields.password.replace(/'/g,"\\'");
                        user.profile_picture = shortPath+file.profile_picture.name.replace(/'/g,"\\'");
                        // retrieve the data from the form and set the registring availiability to true
                        // creating an account
                        create_a_user(resources,req,res,user);
                    });

                });
            }

        });
    }
    // LOGIN AN ACCOUNT
    else if(req.params.path == "session")
    {
        user = {
            "identifier": result.identifier.toLowerCase(),
            "password": result.password
        };
        login_a_user(resources,req,res,user);

    }

    else{
        res.redirect(303,"404");
    }

        });

app.get("/index",function(req,res){
    res.redirect(303,"/");
});
app.get("/",function(req,res){
    data.overall = require('./content.json')["index"];
   res.render("index",data);
});


app.get('/profile/:username',function(req,res){
    try{
        data.session = req.session;
        is_friend(resources,req,function(response){
            data.friend = response;
            data.overall = require('./content.json')["profile"];
            // if profile visited is hiself
            data.self = data.session.username == req.params.username;
            if (req.session.connected && data.overall.connected == false)
                    res.redirect(303, "/home");
            else{
                require('./js_modules/profile.js')(resources, req, function (newData) {
                    data.specific = newData;
                    // if the user is NOT connected and try to reach a connexion required page
                    if (!(req.session.connected) && data.overall.connected == true)
                        res.redirect(303, "/login?redirect=" + path);
                    else
                    {
                        res.render("profile",data);
                    }
                });
            }
        });
    }
    catch(e)
    {
        console.log(e);
        res.redirect(303,'/profile');
    }
});

app.get("/account/disconnect",function(req,res){
    req.session.destroy();
    res.redirect(303,"/login");
});

app.get("/add-friend/:userid",function(req,res){
    add_friend(_assets,req);
});

app.post('/update-interests',function(req,res){
    var interests = req.body.interests;
    console.log(interests);
    connection.query("DELETE FROM USER_INTERESTS WHERE USER_ID =" + req.session.userID, function (err) {
        if (err) console.log(err);
    });
    for(var i = 0; i < interests.length;i++)
    connection.query("INSERT INTO USER_INTERESTS (USER_ID,INTEREST) VALUES ("+req.session.userID+",'"+interests[i].replace(/'/g,"\\'")+"')", function (err) {
        if (err) console.log(err);
    });

});

app.get("/blog/:article",function(req,res){
    var article = req.params.article;
    console.log(article);
    connection.query("SELECT * FROM BLOG WHERE URL ='"+article+"'", function (err,rows) {
        if (err) console.log(err);
        else{
            data.articles = rows;
            data.overall = require('./content.json')['blog'];
            require('./js_modules/blog.js')(resources, req, function (newData) {
                data.specific = newData;
            });
            res.render('article',data);
        }
    });
});

// middleware dealing with requests and sending particular title and css
// GENERAL PATH
app.get("/:path",function(req,res){
    var reqPath = req.path,
    // remove "/"
    path = reqPath.slice(1);

    data.session = req.session;
    data.overall = require('./content.json')[path];
    data.images = require('./images.json');
    // profile
    data.self = true;
    try {
        // if user is connected and try to reach a NOT connexion required page
        require('./js_modules/' + path)(resources, req, function (newData) {
            data.specific = newData;
            if (data.overall != undefined) {
                if (req.session.connected && data.overall.connected == false)
                    res.redirect(303, "/home");
                // if the user is NOT connected and try to reach a connexion required page
                else if (!(req.session.connected) && data.overall.connected == true)
                    res.redirect(303, "/login?redirect=" + path);
                else
                    res.render(path, data);

            }
            else {
                res.redirect(303, "404");
            }
        });
    }

    catch(e) {
            data.specific = {};
        if (data.overall != undefined) {
            if (req.session.connected && data.overall.connected == false)
                res.redirect(303, "/home");
            // if the user is NOT connected and try to reach a connexion required page
            else if (!(req.session.connected) && data.overall.connected == true)
                res.redirect(303, "/login?redirect=" + path);
            else
                res.render(path, data);

        }
        else {
            res.redirect(303,"404");
        }
    }

});

app.post("/edit/:path",function(req,res) {
    if(req.params.path != "true")
        req.session.edit = false;
    else
        req.session.edit = req.params.path;

    res.send("ok");
});

app.post("/user-languages",function(req,res){

    for(var i = req.body.spoken.length - 1; i >= 0; i--)
       connection.query("INSERT INTO USER_LANGUAGES (USER_ID,LANGUAGE,ABBR,LEVEL) VALUES("+req.session.userID+",'"+req.body.spoken[i].language+"','"+req.body.spoken[i].abbr+"','"+req.body.spoken[i].level+"')",function(err){
           if(err) console.log(err)
       })

    for(var j = req.body.learning.length - 1; j >= 0; j--)
        connection.query("INSERT INTO USER_LANGUAGES (USER_ID,LANGUAGE,ABBR,LEVEL,TYPE_LANGUAGE) VALUES("+req.session.userID+",'"+req.body.learning[j].language+"','"+req.body.learning[j].abbr+"','"+req.body.learning[j].level+"',1)",function(err){
            if(err) console.log(err)
        })
    res.send("ok");
});
app.post("/add-like",function(req,res){
    var bool = req.body.operator,
        postId = req.body.id_post;
try{
    if(bool == 'true')
    {
        connection.query("UPDATE POSTS SET NBR_LIKE = NBR_LIKE + 1 WHERE ID = "+postId,function(err){
            if(err) console.log(err)
        })
    }
    else
    {
        connection.query("UPDATE POSTS SET NBR_LIKE = NBR_LIKE - 1 WHERE ID = "+postId,function(err){
            if(err) console.log(err)
        })
    }
    res.send("Number updated")
}
    catch(e){
        res.send(e);
    }
});

app.post("/add-comment",function(req,res){
    var postId = req.body.id_post,
        content = req.body.content.replace(/'/g,"\\'"),
        userId = req.body.id_user;
    try{
        connection.query("INSERT INTO POSTS_COMMENTS (CONTENT,USER_ID,POST_ID) VALUES ('"+content+"',"+userId+","+postId+")",function(e){
            if(e)console.log(e);
        });
        connection.query("UPDATE POSTS SET NBR_COMMENTS = NBR_COMMENTS + 1 WHERE ID = "+postId,function(err){
            if(err) console.log(err)
            res.send("post inserted");
        })
    }
    catch(e){
        res.send(e);
    }
});

app.post("/add-correction",function(req,res){
    var postId = req.body.id_post,
        content = req.body.content.replace(/'/g,"\\'"),
        correction = req.body.correction.replace(/'/g,"\\'"),
        userId = req.body.id_user;
    try{
        connection.query("INSERT INTO POSTS_CORRECTIONS (CONTENT,CONTENT_CORRECTION,USER_ID,POST_ID) VALUES ('"+content+"','"+correction+"',"+userId+","+postId+")",function(e){
            if(e)console.log(e);
        });

        connection.query("UPDATE POSTS SET NBR_CORRECTIONS = NBR_CORRECTIONS + 1 WHERE ID = "+postId,function(err){
            if(err) console.log(err)
            res.send("post inserted");
        })
    }
    catch(e){
        res.send(e);
    }
});




///================
///================
//// API
///================
///================

var router = express.Router();
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

router.route('/users')
    .get(function(req,res){
        connection.query("SELECT * FROM USERS", function (err, rows) {
            if (err) console.log(err);
            else {
                res.send(rows);
            }
        });
    });

router.route('/users/:username')
.get(function(req,res) {
        connection.query("SELECT * FROM USERS WHERE USERNAME ='" + req.params.username + "' OR EMAIL = '" + req.params.username + "'", function (err, rows) {
            if (err) console.log(err);
            else {
                res.send(rows);
            }
        })
    });

router.route('/posts/:userid')
    .get(function(req,res) {
        if(req.params.userid == "undefined")
        {
            res.send(null);
        }
        else{

            connection.query("SELECT POSTS.ID_USER, POSTS.CONTENT_POST,POSTS.POST_DATE, POSTS.IMAGE_PATH, USERS.USERNAME, USERS.PROFILE_PICTURE FROM POSTS INNER JOIN USERS ON POSTS.ID_USER=USERS.ID WHERE ID_USER =" + req.params.userid, function (err, rows) {
                if (err) console.log(err);
                else {
                    res.send(rows);
                }
            });
        }
    })
    .post(function(req,res){
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,file){
            if(err)
                return res.redirect(303,"/error");
            else{
                fs.readFile(file.file_post.path, function (err, data) {
                    var shortPath = "img/users/"+req.session.username.toLowerCase()+"/posts/",
                        newPath = __dirname +"/public/"+ shortPath;
                    // if there is an image post
                    if(file.file_post._writeStream.bytesWritten > 0) {
                        // CREATE PATH
                        mkdirp(newPath, function (err) {
                            if (err) return cb(err);
                            // INSERT FILE
                            fs.writeFile(newPath + file.file_post.name, data, function (err) {
                                if (err) console.log(err);
                            });
                            // post with image
                            connection.query("INSERT INTO POSTS (CONTENT_POST,ID_USER,IMAGE_PATH) VALUES('" + fields.user_text.replace(/'/g,"\\'") + "','" + fields.id_user + "','" + shortPath + file.file_post.name + "')", function (err) {
                                if (err) console.log(err);
                                else {
                                    res.send("done")
                                }
                            })
                        });
                    }
                    else{
                        // post without image
                        connection.query("INSERT INTO POSTS (CONTENT_POST,ID_USER) VALUES('" + fields.user_text.replace(/'/g,"\\'") + "','" + fields.id_user + "')", function (err) {
                            if (err) console.log(err);
                            else {
                                res.send("done")
                            }
                        })
                    }

                });
            }

        });


    });

router.route('/session')
    .get(function(req,res) {
        res.send(req.session);
    });

router.route('/user-interests/:userid')
    .get(function(req,res) {
        connection.query("SELECT * FROM USER_INTERESTS WHERE USER_ID =" + req.params.userid, function (err,rows) {
            if (err) console.log(err);
            else {
                res.send(rows);
            }
        });
    });
router.route('/get-images')
.get(function(req,res){
        var data = require('./images.json');
        res.send(data);
    });

router.route('/update-user/:userid')
      .post(function(req,res){
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,file){
            if(err)
                return res.redirect(303,"/error");
            else{
                connection.query("UPDATE USERS SET CITY='"+fields.city.replace(/'/g,"\\'")+"', BIOGRAPHY='"+fields.bio.replace(/'/g,"\\'")+"',ABOUT = '"+fields.about.replace(/'/g,"\\'")+"', ADDRESS = '"+fields.address.replace(/'/g,"\\'")+"' WHERE ID =" + req.params.userid, function (err) {
                    if (err) console.log(err);
                    else {
                        console.log("user updated");
                        res.send("user updated");
                    }
                })
            }
        });

    });


/*
var disconnected;
// IO

io.on('connection', function(socket){
    disconnected = false;
    if(_assets != null && _assets.resources != undefined)
    _assets.resources.connection.query("UPDATE USERS SET IS_CONNECTED = true WHERE ID ="+_assets.req.session.userID, function (err) {
        if (err) throw err;
        else {
            console.log("user "+ _assets.req.session.username +" connected");
        }
    });
    socket.on('disconnect', function(socket){
        disconnected = true;

        // 5s allow the user to change the page without being dc
        // after 5s the user is considered as deco until he reconnect
        setTimeout(function () {
            if (disconnected)
                _assets.resources.connection.query("UPDATE USERS SET IS_CONNECTED = false WHERE ID ="+_assets.req.session.userID, function (err) {
                    if (err) throw err;
                    else {
                        console.log("user "+ _assets.req.session.username +" disconnected");
                    }
                });
        }, 5000);
    });


    socket.on('forceDisconnect', function(){
        socket.disconnect();
        console.log("disconnected")

    });
});

*/


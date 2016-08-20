
module.exports = function(resources,req,callback){
var data = {};
    if(req.params.username == undefined)
        req.params.username = req.session.username;

    resources.connection.query("SELECT * FROM USERS WHERE USERNAME ='"+req.params.username+"'", function (err, rows) {
        if (err) console.log(err);
        else {
            data.user = rows;
            resources.connection.query("SELECT * FROM USER_INTERESTS WHERE USER_ID ="+rows[0].ID, function (err, rows) {
                if (err) console.log(err);
                else {
                    data.interests = rows;
                    resources.connection.query("SELECT POSTS.ID_USER, POSTS.CONTENT_POST,POSTS.POST_DATE, POSTS.IMAGE_PATH, USERS.USERNAME, USERS.PROFILE_PICTURE FROM POSTS INNER JOIN USERS ON POSTS.ID_USER=USERS.ID ORDER BY POST_DATE DESC", function (err, rows) {
                        if (err) console.log(err);
                        else {
                            data.posts = rows;
                            resources.connection.query("SELECT POSTS.ID, POSTS.NBR_LIKE, POSTS.NBR_COMMENTS, POSTS.NBR_CORRECTIONS, POSTS.ID_USER, POSTS.CONTENT_POST, POSTS.POST_DATE, POSTS.IMAGE_PATH, USERS.USERNAME, USERS.PROFILE_PICTURE FROM POSTS INNER JOIN USERS ON POSTS.ID_USER = "+data.user[0].ID+" AND POSTS.ID_USER=USERS.ID ORDER BY POST_DATE DESC", function (err, rows) {
                                if (err) console.log(err);
                                else {
                                    data.posts = rows;
                                    data.max = rows.length;
                                    data.counter = 0;
                                    for(var i = rows.length-1; i >= 0; i--)
                                        data.posts[i].POST_DATE = resources.moment(data.posts[i].POST_DATE).fromNow();
                                    if(data.max > 0){
                                    get_user_languages(resources,req,data,function(data){
                                        get_posts_languages(resources,req,data,function(data){
                                            get_posts_comments(resources,req,data,callback);
                                        })
                                    });
                                    }
                                    else{
                                        get_user_languages(resources,req,data,callback);
                                        data.posts = null;
                                    }
                                }
                            });
                        }
                    });
                }
            })
        }

});

    this.get_user_languages = function(resources,req,data,callback){
        resources.connection.query("SELECT * FROM USER_LANGUAGES WHERE USER_ID = "+ data.user[0].ID+" AND TYPE_LANGUAGE = 0 ORDER BY LEVEL DESC"  , function (err, rows2) {
            if (err) console.log(err);
            else {
                data.user[0].spoken = rows2;
                console.log(rows2)
                resources.connection.query("SELECT * FROM USER_LANGUAGES WHERE USER_ID = "+ data.user[0].ID+" AND TYPE_LANGUAGE = 1 ORDER BY LEVEL DESC"  , function (err, rows3) {
                    if (err) console.log(err);
                    else {
                        data.user[0].learning = rows3;
                        callback(data)
                    }
                });

            }
        });
    }

    this.get_posts_languages = function(resources,req,data,callback){
        resources.connection.query("SELECT * FROM USER_LANGUAGES WHERE USER_ID ="+data.posts[data.counter].ID_USER, function (err, rows2) {
            if (err) console.log(err);
            else {
                data.posts[data.counter].languages = rows2;
                data.counter++;
                if (data.counter >= data.max)
                {
                    data.counter = 0;
                    callback(data);
                }
                else{
                    get_posts_languages(resources,req,data,callback);
                }
            }
        });
    };

    this.get_posts_comments = function(resources,req,data,callback){
        resources.connection.query("SELECT POSTS_COMMENTS.POST_DATE, POSTS_COMMENTS.CONTENT, POSTS_COMMENTS.POST_ID, POSTS_COMMENTS.USER_ID, POSTS_COMMENTS.ID, USERS.ID, USERS.PROFILE_PICTURE, USERS.USERNAME, USERS.ID FROM POSTS_COMMENTS INNER JOIN USERS ON POSTS_COMMENTS.USER_ID=USERS.ID WHERE POST_ID =" + data.posts[data.counter].ID + " ORDER BY POST_DATE DESC", function (err, rows3) {
            if (err) console.log(err);
            else{
                for(var i = rows3.length-1; i >= 0; i--)
                    rows3[i].POST_DATE = resources.moment(rows3[i].POST_DATE).fromNow();
                data.posts[data.counter].comments = rows3;
                resources.connection.query("SELECT POSTS_CORRECTIONS.POST_DATE, POSTS_CORRECTIONS.CONTENT, POSTS_CORRECTIONS.CONTENT_CORRECTION, POSTS_CORRECTIONS.POST_ID, POSTS_CORRECTIONS.USER_ID, POSTS_CORRECTIONS.ID, USERS.ID, USERS.PROFILE_PICTURE, USERS.USERNAME FROM POSTS_CORRECTIONS INNER JOIN USERS ON POSTS_CORRECTIONS.USER_ID=USERS.ID WHERE POST_ID =" + data.posts[data.counter].ID + " ORDER BY POST_DATE DESC", function (err, rows4) {
                    if (err) console.log(err);
                    else {
                        for (var i = rows4.length - 1; i >= 0; i--)
                            rows4[i].POST_DATE = resources.moment(rows4[i].POST_DATE).fromNow();
                        data.posts[data.counter].corrections = rows4;
                        data.counter++;
                        if (data.counter >= data.max)
                        {
                            data.counter = 0;
                            callback(data);
                        }
                        else{
                            get_posts_comments(resources,req,data,callback);
                        }
                    }
                });
            }
        });
    };



};
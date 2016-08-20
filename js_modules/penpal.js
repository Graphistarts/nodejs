
module.exports = function(resources,req,callback){
var data = {};
        resources.connection.query("SELECT * FROM USERS WHERE ID != "+req.session.userID, function (err, rows) {
            if (err) console.log(err);
            else {
                data.users = rows;
                data.max = rows.length;
                data.counter = 0;
                get_user_languages(resources,req,data,callback);
            }
        });

    this.get_user_languages = function(resources,req,data,callback){
        resources.connection.query("SELECT * FROM USER_LANGUAGES WHERE USER_ID = "+ data.users[data.counter].ID+" AND TYPE_LANGUAGE = 0 ORDER BY LEVEL DESC LIMIT 3"  , function (err, rows2) {
            if (err) console.log(err);
            else {
                data.users[data.counter].spoken = rows2;
                resources.connection.query("SELECT * FROM USER_LANGUAGES WHERE USER_ID = "+ data.users[data.counter].ID+" AND TYPE_LANGUAGE = 1 ORDER BY LEVEL DESC LIMIT 3"  , function (err, rows3) {
                    if (err) console.log(err);
                    else {
                        data.users[data.counter].learning = rows3;
                        for(var i = rows3.length; i < 3; i ++){
                            data.users[data.counter].learning[i]  = null;
                        }
                        data.counter++;
                        if (data.counter >= data.max)
                        {
                            data.counter = 0;
                            callback(data);
                        }
                        else{
                            get_user_languages(resources,req,data,callback);
                        }
                    }
                });

            }
        });
    }



};
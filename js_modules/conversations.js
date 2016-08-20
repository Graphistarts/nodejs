
module.exports = function(resources,req,callback){
/*
    resources.connection.query("SELECT * FROM USER_RELATION WHERE USER_ID ="+req.session.userID, function (err, rows) {
        if (err) console.log(err);
        else {
            var data = {};
                data.friends = new Array();
                data.max = rows.length;
                data.counter = 0;
                data.rows = rows;
                get_user_infos(resources,req,data,function(data){
                    callback(data);
                });
        }


});
*/
    get_user_infos(resources,req,data,function(data){
        callback(data);
    });

    this.get_user_infos = function(resources,req,data,callback){
        resources.connection.query("SELECT * FROM USERS WHERE ID =" + data.rows[data.counter].USER2_ID, function (err, rows2) {
            if (err) console.log(err);
            else {
                /* //if the user is not connected
                 if(!rows2[0].IS_CONNECTED)
                 rows2[2]._assets.resources.moment(data.posts[i].POST_DATE).fromNow();
                 */
                data.friends.push(rows2[0]);
                data.counter++;
                if (data.counter >= data.max)
                    callback(data);
                else{
                    get_user_infos(resources,req,data,callback);
                }
            }
        });
    };


};
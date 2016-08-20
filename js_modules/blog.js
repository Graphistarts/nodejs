module.exports = function(resources,req,callback){
    var data = {};
    resources.connection.query("SELECT * FROM BLOG", function (err, rows) {
        if (err) console.log(err);
        else {
            data.posts = rows;
            callback(data);
        }
    });
};
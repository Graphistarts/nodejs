
module.exports = function(resources,req,callback){
    try{
        var data = {
            "languages":require('../languages.json')
        };
    }
    catch(e)
    {
        data = e;
    }
        callback(data);
};
module.exports = function(){
    // noop is an empty function that is created to replace function with no call back
    // isCallback allows me to check whether there is a callback and replace by an empty function if there is no callback
    var noop = function(){},
        isCallback = function(callback){
            if(typeof callback == "function")
                return callback;
            return noop;
        };

    /**
     * NAME : test
     * DESCRIPTION : test function
     * PARAMETERS : depends on the test
     * RESULT : depends on the test
     **/
    this.test = function(value,callback){
        // Call before each function
        callback = isCallback(callback);
        console.log(value);

    };


    /**
     * NAME : insert_user
     * DESCRIPTION : insert a user
     * PARAMETERS : connection - username - email
     * RESULT : return 1 if inserted
     **/
    this.insert_user = function(connection,username,email,callback){
        callback = isCallback(callback);
        connection.query("INSERT INTO USERS (USERNAME,EMAIL) VALUES('"+username+"','"+email+"')", function(err) {
            if (err) console.log(err);
            else{
                //dev mode
                console.log("insertion of user : " + username + " with email : " + email);
                callback();
                return 1;
            }
        });
    };


    /**
     * NAME : select_all_users
     * DESCRIPTION : select all users from the database
     * PARAMETERS : connection
     * RESULT : - return table of rows if result
     *          - return 0 if no result
    **/
    this.select_all_users = function(connection,callback){
        callback = isCallback(callback);
        connection.query("SELECT * FROM USERS", function(err, rows) {
            if (err) console.log(err);
            else
            {
                if(rows.length > 0)
                {
                    callback();
                    return rows;
                }
                callback();
                return 0;
            }
        });
    };

    /**
     * NAME : select_user_with_email
     * DESCRIPTION : select all users from the database which match the email
     * PARAMETERS : connection - email
     * RESULT : - return table of rows if result
     *          - return 0 if no result
     **/
    this.select_user_with_email = function(connection,email,callback){
        callback = isCallback(callback);
        connection.query("SELECT * FROM USERS WHERE EMAIL = '" + email +"'", function(err, rows) {
            if (err) console.log(err);
            else
            {
                if(rows.length > 0)
                {
                    callback();
                    return rows;
                }
                callback();
                return 0;
            }
        });
    };

    /**
     * NAME : select_user_with_username
     * DESCRIPTION : select all users from the database which match the username
     * PARAMETERS : connection - username
     * RESULT : - return table of rows if result
     *          - return 0 if no result
     **/
    this.select_user_with_username = function(connection,username,callback){
        callback = isCallback(callback);
        connection.query("SELECT * FROM USERS WHERE USERNAME = '" + username +"'", function(err, rows) {
            if (err) console.log(err);
            else
            {
                if(rows.length > 0)
                {
                    callback();
                    return rows;
                }
                callback();
                return 0;
            }
        });
    };





    var noop = function () {},
        isCallback = function (callback) {
            if (typeof callback == "function")
                return callback;
            return noop;
        };


    this.create_a_user = function (resources,req,res, user) {
        resources.connection.query("SELECT * FROM USERS WHERE EMAIL = '" + user.email + "'", function (err, rows) {
            if (err) console.log(err);
            else {
                // if there is a match (statement true), return false
                user.available[1] = rows.length > 0;
                resources.connection.query("SELECT * FROM USERS WHERE USERNAME = '" + user.username + "'", function (err, rows) {
                    if (err) console.log(err);
                    else {
                        // if there is a match (statement true), return false
                        user.available[0] = rows.length > 0;
                        if (!user.available[0] && !user.available[1]) {
                            var encryptedPassword = resources.bcrypt.hashSync(user.password);

                            resources.connection.query("INSERT INTO USERS (USERNAME,EMAIL,PROFILE_PICTURE,PASSWORD) VALUES('" + user.username + "','" + user.email + "','"+user.profile_picture +"','"+ encryptedPassword + "')", function (err) {
                                if (err) console.log(err);
                                else {
                                    resources.connection.query("SELECT ID,USERNAME,PROFILE_PICTURE FROM USERS ORDER BY ID DESC LIMIT 1 ", function (err,db){
                                        if (err) console.log(err);
                                        else{
                                            //dev mode
                                            console.log("insertion of user : " + user.username + " with email : " + user.email);
                                            // create a session

                                            req.session.connected = true;
                                            req.session.userID = db[0].ID;
                                            req.session.username = db[0].USERNAME;
                                            req.session.profile_picture = db[0].PROFILE_PICTURE;
                                            res.redirect(303, "/introduction");
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            if (user.available[0])
                                console.log("Username Error");
                            if (user.available[1])
                                console.log("Email Error");
                            req.session.user = user;
                            res.redirect(303, "/signup");
                        }

                    }
                });
            }
        });

    };



    this.login_a_user = function (resources,req,res, user) {
        resources.connection.query("SELECT * FROM USERS WHERE EMAIL = '" + user.identifier + "'", function (err, rows) {
            if (err)
                console.log(err);
            else {
                if(rows.length > 0)
                {
                    console.log('found username')
                    var db = rows[0];
                    if(resources.bcrypt.compareSync(user.password, db.PASSWORD))
                    {
                        // create a session
                        req.session.connected = true;
                        req.session.userID = db.ID;
                        req.session.username = db.USERNAME;
                        req.session.profile_picture = db.PROFILE_PICTURE;
                        res.redirect(303, "/home");
                    }
                    else{
                        console.log("password error");
                        req.session.loginError = user;
                        res.redirect(303, "/login?error=1");
                    }
                }
                else{
                    console.log("not found");
                    req.session.loginError = user;
                    res.redirect(303, "/login");
                }
            }
        });
    };

    this.add_friend = function(resources,req){
        var userParam = req.params.userid;
        resources.connection.query("SELECT * FROM USER_RELATION WHERE USER_ID ="+req.session.userID+" AND USER2_ID ="+userParam, function (err, rows) {
            if (err) console.log(err);
            else {
                // If they are friends
                if(rows.length > 0)
                    console.log("You are already friends");
                // They are not friends yet
                else{
                    // insert the double relation
                    resources.connection.query("INSERT INTO USER_RELATION (USER_ID,USER2_ID) VALUES ("+req.session.userID+","+userParam+"), ("+userParam+","+req.session.userID+")", function (err, rows) {
                        if (err) console.log(err);
                        else {
                            console.log("friends added");
                        }
                    });
                }
            }
        });
    }

    this.is_friend = function(resources,req,callback) {
        var userParam = req.params.username;
        resources.connection.query("SELECT ID FROM USERS WHERE USERNAME ='" +userParam+"'", function (err, rows) {
            if (err) console.log(err);
            else {
                resources.connection.query("SELECT * FROM USER_RELATION WHERE USER_ID =" + req.session.userID + " AND USER2_ID =" + rows[0].ID, function (err, rows) {
                    if (err) console.log(err);
                    else {
                        // if they are friends
                        if (rows.length > 0)
                            callback(true);
                        else
                            callback(false);

                    }
                });
            }
        })
    }

    this.levensthein = function(reference, newWord){

        // TIMER
        var startTime = new Date().getTime();
        var elapsedTime = 0;


        var rLength = reference.length,
            nLength = newWord.length,
            shortTable = [],
            longTable = [],
            matrix = [],
            error = [],
            distLevensthein = 0,
            positionPathX = 0,
            positionPathY = 0;


        if(rLength == 0) return 0;
        if(nLength == 0) return -1;
        if(rLength > nLength)
        {
            longTable = rLength;
            shortTable = nLength;
        }
        else{
            longTable = nLength;
            shortTable = rLength;
        }

        // increment along the first column of each row
        for(var i = longTable; i >= 0; i--){
            matrix[i] = [i];
        }

        for(var j = shortTable; j >= 0; j--){
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for(i = 1; i <= longTable; i++){
            for(j = 1; j <= shortTable; j++){
                // Whether the letter of the word 1 == letter of the word 2
                if(longTable.charAt(i-1) == shortTable.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                }

                // Error in the letter comparison
                else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1], Math.min(matrix[i][j-1], matrix[i-1][j])) + 1;
                }

                // Check whether the diagonal is equal to the previous path position
                if(i == (positionPathY+1) && j == (positionPathX+1)){
                    var previousX = positionPathX,
                        previousY = positionPathY;
                    // waiting for the script to complete the table
                    // while the script reaches the [i+1,j+1] position, it searches what is the good path
                    // Check the right cell
                    // if right == bottom == diag: go to the right
                    if(matrix[positionPathY][positionPathX] == matrix[positionPathY][positionPathX +1] ||
                        (matrix[positionPathY+1][positionPathX+1] == matrix[positionPathY][positionPathX+1] &&
                        matrix[positionPathY+1][positionPathX+1] == matrix[positionPathY+1][positionPathX])
                    )
                    {
                        positionPathX += 1; // Right
                        // console.log("right");
                    }
                    else if(matrix[positionPathY][positionPathX] != matrix[positionPathY+1][positionPathX]){

                        positionPathY = i;
                        positionPathX = j;
                        // DIAG
                        //console.log("diag")
                    }
                    else{

                        positionPathX += 1; // Right
                        // console.log("right");

                        //positionPathY +=1; // Down
                        //console.log("down")
                    }

                    if(matrix[previousY][previousX] != matrix[positionPathY][positionPathX])
                    console.log(matrix[positionPathY][positionPathX]);
                    //  console.log(positionPathY,positionPathX);é
                }
            }
        }
    }

};
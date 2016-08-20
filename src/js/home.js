/**
 * Created by kevinkevers on 26/12/15.
 */
$(document).ready(function() {
var user = {},
    error = "";
    var $form = $('form');
    $form.submit(function() {
        var minSize = 2;
        if(($(".user-post form #user_text").val().length) >  minSize)
        {
            var formData = new FormData($('form')[0]);
           $.ajax({
                url: $(this).attr('action'),
                data: formData,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(response){
                    console.log(response);
                    location.reload();
                },
                error: function(err){
                    alert(err);
                }
            });
        }
        else{
            error = "<p>Your post must contain at least 2 characters</p>";
                $('.error').html(error);
                $('.error').addClass("active");
        }
        return false;
    });




/*
    io.on('connection', function(socket){
        console.log(session);
        connection.query("UPDATE USERS SET LAST_CONNECTION = '"+moment.now()+"' WHERE ID = "+session.userID, function (err) {
            if (err) console.log(err)
            else {
                console.log("last connection updated");
            }
        })
    });
    */
});
/**
 * Created by kevinkevers on 26/12/15.
 */
$(document).ready(function() {

    $('#profile_picture').on('change',function(e){
       $('.profile_picture').html($(this).val().split('\\').pop());
    });

    var $form = $('form');
    $form.submit(function(e) {
        var error = "";
        if($('input[name="username"]').val().length < 2 || $('input[name="username"]').val().length > 30)
            error += "<p>Your username must be between 3 and 30 characters.</p>";

        if($('input[name="password"]').val().length < 5 || $('input[name="password"]').val().length > 30)
            error += "<p>Your password must be between 6 and 30 characters.</p>";

        if($('input[name="profile_picture"]').val() == "")
            error += "<p>Please choose a profile picture</p>";

        if(/\S+@\S+\.\S+/.test($('input[name="email"]')))
            error += "<p>Your email is not valid</p>";

        var formData = new FormData($('form')[0]);
        if(error != "")
        {
            $('.error').html(error);
            $('.error').addClass("active");
            return false;
        }
        else{
            return true;
        }

    });

});
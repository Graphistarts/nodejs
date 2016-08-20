/**
 * Created by kevinkevers on 26/12/15.
 */
$(document).ready(function() {
    var edit = false,
        exeption = false,
        interests = new Array();


    $.ajax({
        url: "/api/session/",
        type: 'get',
        success: function(response){
            edit = response.edit == "true";
            $.ajax({
                url: "/api/user-interests/"+response.userID,
                type: 'get',
                success: function(response){

                    for(var i = response.length - 1;i >=0; i--)
                    {
                        interests.push(response[i].INTEREST);
                    }
                }
            });
        }
    });


    $('.edit-profile').on("click",function(e){
        $.ajax({
            url: "/edit/true",
            type: 'post',
            success: function(response){
                location.reload();
            }
        });
    });
    $('.cancel-profile').on("click",function(e){
        exeption = true;
        $.ajax({
        url: "/edit/false",
        type: 'post',
        success: function(response){
                location.reload();
            }
        });
    });

$('.add-friend').on("click",function(e){
    e.preventDefault();
    $.ajax({
        url: $(this).attr('href'),
        type: 'get',
        success: function(response){
            console.log(response)
        }
    });
});

    $('.save-profile').on("click",function(e){
        console.log(interests)
        $.ajax({
            url: "/update-interests",
            data: {"interests":interests},
            type: 'POST'

        });

        var $form = $('form');
        $form.submit(function() {
            var formData = new FormData($('form')[0]);
            $.ajax({
                url: $(this).attr('action'),
                data: formData,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(response){
                            $.ajax({
                                url: "/edit/false",
                                type: 'post',
                                success: function (response) {
                                    location.reload();
                                }
                            });
                },
                error: function(err){
                    alert(err);
                }
            });
            return false;
        });

    });

    $('body').on('click','.interests .editable',function(e){
        var which = $(this).text(),
            index = interests.indexOf(which);
        if(index > -1){
            interests.splice(index,1);
        }
       $(this).remove();
    });

    $('.submit-add-interest').on('click',function(e){
        var addInterest = $('.add-interest'),
            newInterest = "<li class='editable'>"+addInterest.val()+"</li>";
        $('.interests ul').append(newInterest);
        interests.push(addInterest.val());
        addInterest.val("");
        console.log(interests);
    });
/*
    window.onbeforeunload = confirmExit;
    function confirmExit()
    {
        if(edit && !exeption)
            return "You're making changes on your profile. Are you sure you want to leave ?";
    }
    */


    $('.add-friend').on('click',function(e){
        var template = '<span class="friend">Request sent</span>';
        $(this).replaceWith(template);
    })

    $('.helper').on("click",function(e){
        $('.helper .content').toggleClass("show");
    })


});
/**
 * Created by kevinkevers on 26/12/15.
 */
$(document).ready(function() {
    var socket = io(),
        profile = $('.dd-profile');
    profile.on('click',function(e){
        $('.dd-profile .dd').toggleClass("show");
        if (!profile.is(e.target) && profile.has(e.target).length === 0)
        {
            $('.dd-profile .dd').removeClass("show");
        }

    });

    $('.disconnect').on("click",function(){
        socket.emit('forceDisconnect');
    });

    $.ajax({
        url: '/api/get-images',
        data: "",
        processData: false,
        contentType: false,
        type: 'GET',
        success: function(response){
            var images = response;
            $('body .heart').find('span').html(images.heart);
            $('body .comment').find('span').html(images.comment);
            $('body .correct').find('span').html(images.correct);
        },
        error: function(err){
            alert(err);
        }
    });

    $('body .heart').on('click',function(){
       var span = $(this).find('span'),
           strong = $(this).find('strong'),
           operator = true;
        var which = $(this).parents('.post-container').attr('id');

        span.toggleClass("on");
        // if hasn't been clicked yet
        if(span.hasClass('on'))
        {
            operator = true;
            strong.html(parseInt(strong.html())+1);
        }
        else
        {
            operator = false;
            strong.html(parseInt(strong.html())-1);
        }

        $.ajax({
            url: "/add-like",
            type: 'post',
            data:{
                "operator":operator,
                "id_post":which
            },
            success: function(response){
                console.log(response);
            }
        });
    });


    $('.reaction-post .comment').on('click',function(e){
        $(this).parents('.post-container').find('.comment-container').toggleClass('active');
        $(this).parents('.post-container').find('.correction-container').removeClass('active');
    });

    $('.reaction-post .correct').on('click',function(e){
        $(this).parents('.post-container').find('.correction-container').toggleClass('active');
        $(this).parents('.post-container').find('.comment-container').removeClass('active');
    });

    $('.actions .cancel').on('click',function(e){

        $(this).parents('.user-correction-post').find('.activator').addClass("active");
        $(this).parents('.corrector').removeClass("active");
    });

    function displayError(value){
        return "<strong>" + value + "</strong>";
    }

    function levensthein(word1, word2){
        // TIMER
        var startTime = new Date().getTime();
        var elapsedTime = 0;


        var length1 = word1.length,
            length2 = word2.length,
            result = {},
            corrShortWord = "",
            corrLongWord = "",
            shortWord = [],
            longWord = [],
            matrix = [],
            positionPathX = 0,
            positionPathY = 0,
            previousX = 0,
            previousY = 0;


        if(length1 == 0) return 0;
        if(length2 == 0) return -1;
        if(length1 > length2)
        {
            longWord = word1;
            shortWord = word2;
        }
        else{
            longWord = word2;
            shortWord = word1;
        }

        // increment along the first column of each row
        for(var i = shortWord.length; i >= 0; i--){
            matrix[i] = [i];
        }

        for(var j = longWord.length; j >= 0; j--){
            matrix[0][j] = j;
        }
        // Fill in the rest of the matrix
        for(i = 1; i <= shortWord.length; i++){
            for(j = 1; j <= longWord.length; j++){
                // Whether the letter of the word 1 == letter of the word 2
                if(shortWord[i-1] == longWord[j-1]){
                    matrix[i][j] = matrix[i-1][j-1];
                }

                // Error in the letter comparison
                else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1], Math.min(matrix[i][j-1], matrix[i-1][j])) + 1;
                }

                // Check whether the diagonal is equal to the previous path position
                if(i == (positionPathY+1) && j == (positionPathX+1)){
                    previousX = positionPathX;
                    previousY = positionPathY;
                    // waiting for the script to complete the table
                    // while the script reaches the [i+1,j+1] position, it searches what is the good path
                    if(matrix[positionPathY][positionPathX] != matrix[positionPathY][positionPathX+1]||
                        (matrix[positionPathY+1][positionPathX+1] == matrix[positionPathY][positionPathX+1] &&
                        matrix[positionPathY+1][positionPathX+1] == matrix[positionPathY+1][positionPathX])){
                        positionPathY = i;
                        positionPathX = j;
                        // DIAG
                        //console.log("diag")
                        if(matrix[positionPathY][positionPathX] > matrix[previousY][previousX])
                            shortWord[positionPathX - 1] = displayError(shortWord[positionPathX - 1]);
                    }
                    // Check the right cell
                    // if right == bottom == diag: go to the right
                    else if(matrix[positionPathY][positionPathX] == matrix[positionPathY][positionPathX +1])
                    {
                        positionPathX += 1; // Right
                        //console.log("right");
                    }
                    else{

                        positionPathX += 1; // Right
                        //console.log("right --");

                        //positionPathY +=1; // Down
                        //console.log("down")
                    }
                }
            }
            if(matrix[positionPathY][positionPathX] > matrix[previousY][previousX])
                longWord[positionPathX - 1] = displayError(longWord[positionPathX - 1]);
        }

        for(var k = positionPathX; k <= longWord.length; k++)
        {
            if(matrix[shortWord.length][k-1] < matrix[shortWord.length][k])
                longWord[k - 1] = displayError(longWord[k - 1]);
        }
        /*
         for(var i = 0; i < shortWord.length+1; i ++)
         console.log(matrix[i]);
         */
        var sentence ="";
        for(var u = 0; u < longWord.length; u++)
            corrLongWord += longWord[u] + " ";

        for(var v = 0; v < shortWord.length; v++)
            corrShortWord += shortWord[v] + " ";
        if(word1.length > word2.length)
        {
            result.corrWord1 = corrLongWord;
            result.corrWord2 = corrShortWord;
        }
        else{
            result.corrWord1 = corrShortWord;
            result.corrWord2 = corrLongWord;
        }
        return result;
    }

    $.ajax({
        url: "/api/session",
        type: 'get',
        success: function (response) {

            $('.user-comment-post textarea').focus(function(e){
                var newComment = "";
                $(this).on('keydown',function(e){
                    if(e.keyCode == "13" && !e.shiftKey)
                    {
                        var parentWhich = $(this).parents('.post-container'),
                            which = parentWhich.attr('id');
                            newComment ='<li> <a href="/profile/'+response.username+'"><img src="/'+response.profile_picture+'" alt="profile picture of '+response.username+'"/></a> <div class="user-comment"> <div class="comment-infos clearfix"> <a href="">'+response.username+'</a> <span class="timer">a few seconds ago</span> </div> <p>'+$(this).val()+'</p> </div> </li>';
                        $(this).parents('.comment-container').find('.comments-summary ul').prepend(newComment);
                        var content = $(this).val();
                        $.ajax({
                            url: "/add-comment",
                            type: 'post',
                            data:{
                                "id_post":which,
                                "id_user": response.userID,
                                "content": content
                            },
                            success: function(response){
                                parentWhich.find('.comment strong').html(parseInt(parentWhich.find('.comment strong').html())+1);
                            }
                        });
                        $(this).val("");
                        return false;
                    }
                });
            });
            $('.actions .save').on('click',function(e){
                var container = $(this).parents('.post-container'),
                    corr = container.find('.corrector textarea').val().split(" "),
                    ref = container.find('.post .content-post p').text().split(" "),
                    corrections = levensthein(ref,corr),
                    parentWhich = $(this).parents('.post-container'),
                    which = parentWhich.attr('id');

                var template = "<li> <a href='/profile/"+response.username+"'><img src='/"+response.profile_picture+"' alt=''/></a> <div class='user-correction'> <div class='correction-infos clearfix'> <a href='/profile/"+response.username+"'>"+response.username+"</a> <span class='timer'>a few seconds ago</span> </div> <div class='correction'> <p class='text'>"+corrections.corrWord1+"</p> <p class='text-correction'>"+corrections.corrWord2+"</p></div> </div></li>";
                container.find('.corrections-summary ul').prepend(template);
                $.ajax({
                    url: "/add-correction",
                    type: 'post',
                    data:{
                        "id_post":which,
                        "id_user": response.userID,
                        "content": corrections.corrWord1,
                        "correction" : corrections.corrWord2
                    },
                    success: function(response){
                        parentWhich.find('.correct strong').html(parseInt(parentWhich.find('.correct strong').html())+1);
                    }
                });

                $(this).parents('.actions').find(".cancel").trigger("click");
            });

            $('#file_post').on('change',function(e){
                $('.name-file').text($(this).val().split('\\').pop());
            })
        }
    });

    $("body").on('click','.more-options',function(e){
        $(this).parents('.options').find('.more-options-dd').toggleClass("active");
    })

    $('.activator').on('click',function(e){
        $(this).removeClass("active");
        $(this).parents(".user-correction-post").find('.corrector').addClass("active");
    });

    $('.corrector textarea').each(function(e){
        var value = $(this).parents('.post-container').find('.content-post p').text();
        $(this).text(value);
    });

});
/**
 * Created by kevinkevers on 26/12/15.
 */
$(document).ready(function() {
    var addition = $('.chat').height() - $('.chat header').height() - $('.input-comment').height();
    $('.chat .content-chat').height(addition - 110);
    $('body').dblclick('.you .text',function () {
            if(window.getSelection().toString() != "")
            {
                var coord = getSelectionCoords();
                $('.tools').css("top",coord.y - 40);
                $('.tools').css("left",coord.x);
                $('.tools').addClass('show');

            }
    });

    $('body').on('click','.edit',function(e){
            var textarea = $(this).parent().find('textarea'),
            heightTextarea = $(this).parent().find('.text').height();
        $(this).parents(".message").find('.correction').toggleClass('show');
        $(this).parents(".message").find('.actions').toggleClass('active');
        $(this).parents(".message").find('.text').toggleClass('show');
        if($(this).parents(".message").find('.text-corr').hasClass('show'))
        {
            $(this).parents(".message").find('.display-correction').trigger("click");
        }
        textarea.css('height', heightTextarea +"px");
    });

    $('body').on('click','.cancel',function(e){
        $(this).parents(".message").find(".edit").trigger("click");
    });

    $('body').on('click','.display-correction',function(e){
        $(this).parent().find('.text-corr').toggleClass('show');
        $(this).parent().find('.text').toggleClass('show-error');


        if ($(this).parent().find('.text-corr').hasClass('show'))
            $(this).text('Hide correction');
        else
            $(this).text('Show correction')

    });

    $('body').on('click',function(e){
        if (!$('.tools').is(e.target) && $('.tools').has(e.target).length === 0)
            $('.tools').removeClass('show');
    });

    function getSelectionCoords(win) {
        win = win || window;
        var doc = win.document;
        var sel = doc.selection, range, rects, rect;
        var x = 0, y = 0;
        if (sel) {
            if (sel.type != "Control") {
                range = sel.createRange();
                range.collapse(true);
                x = range.boundingLeft;
                y = range.boundingTop;
            }
        } else if (win.getSelection) {
            sel = win.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getClientRects) {
                    range.collapse(true);
                    rects = range.getClientRects();
                    if (rects.length > 0) {
                        rect = rects[0];
                    }
                    x = rect.left;
                    y = rect.top;
                }
                // Fall back to inserting a temporary element
                if (x == 0 && y == 0) {
                    var span = doc.createElement("span");
                    if (span.getClientRects) {
                        // Ensure span has dimensions and position by
                        // adding a zero-width space character
                        span.appendChild( doc.createTextNode("\u200b") );
                        range.insertNode(span);
                        rect = span.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                        var spanParent = span.parentNode;
                        spanParent.removeChild(span);

                        // Glue any broken text nodes back together
                        spanParent.normalize();
                    }
                }
            }
        }
        return { x: x, y: y };
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


    function displayError(value){
        return "<strong>" + value + "</strong>";
    }


    $('body').on('click','.actions .save',function(){
        var message = $(this).parents('.message'),
            ref = message.find('.text').text().split(" "),
            corr = message.find('textarea').val().split(" "),
            corrections = levensthein(ref,corr);

        if(corrections != 0 && corrections != -1)
        {
            message.find('.display-correction').addClass("show");
            message.find('.text-corr').html(corrections.corrWord2);
            message.find('.text').html(corrections.corrWord1);
        }
        message.find('.edit').trigger('click');

    });

    $('.input-comment').on('keyup',function(e){
        if(e.keyCode == "13")
        {
            var value = $('.input-message').val(),
            template = "<div class='message clearfix'> <div class='bubble'> <p>"+value+"</p></div> </div>";
            $('.chat .content-chat').append(template);
            $('.chat .content-chat').scrollTop($('.chat .content-chat')[0].scrollHeight - 80);
            $('.input-message').val("");
        }
    });

    $('.choices .no').on('click',function(e){
        $(this).parents('.add-friend').replaceWith("");
    });

    $('.choices .yes').on('click',function(e){
        var parents = $(this).parents('.add-friend'),
            name = parents.find("strong").html(),
            img = parents.find("img").attr("src");

        var template = '<li> <button> <span class="is-connected connected"></span> <img class="mini-pic" src="'+img+'" alt="profile picture of '+name+'"/> <img src="../img/flags/fr.jpg" alt="" class="country"/> <p><strong>'+name+'</strong><span class="place">France</span></p> </button> </li>';
        parents.replaceWith(template);
    });
    var chat = [ '<div class="you message clearfix"> <a href="/profile/"><img class="mini-pic" src="../img/users/user_profile_1.jpg" alt=""/></a> <div class="bubble"> <button class="edit"><img src="../img/correct.svg" alt="edit button"/></button> <div class="container-content"> <p class="text show">Hi, I am Katrin, how are you ? As I saw, you are a party lover ! Do you go to Tommorowland this year ?</p> <p class="text-corr"></p> <p class="correction"> <textarea>Hi, I am Katrin, how are you ? As I saw, you are a party lover ! Do you go to Tommorowland this year ?</textarea> <div class="actions"> <button cta-text="Cancel" class="cta cta2 cancel">Cancel</button> <button cta-text="Save" class="cta save">Save</button> </div> </p> </div> <button class="display-correction">Show correction</button> </div> </div> <div class="message clearfix"> <div class="bubble"> <div class="container-content"> <p class="text show">Hey Katrin, ja ich <strong>liebe</strong> party aber ich werde leider nicht da sein weil ich schon zum party von <strong>meine</strong> schwester bin :(</p> <p class="text-corr">Hey Katrin, ja ich <strong>mag</strong> party <strong>gern</strong> aber ich werde leider nicht da sein weil ich schon zum party von <strong>meiner</strong> schwester bin :(</p> </div> </div> <button class="display-correction show">Show correction</button> </div><div class="you message clearfix"> <a href="/profile/"><img class="mini-pic" src="../img/users/user_profile_1.jpg" alt=""/></a> <div class="bubble"> <button class="edit"><img src="../img/correct.svg" alt="edit button"/></button> <div class="container-content"> <p class="text show">Oh hard luck ! Otherwise what is your favorite type of song ?</p> <p class="text-corr"></p> <p class="correction"> <textarea>Oh hard luck ! Otherwise what is your favorite type of song ?</textarea> <div class="actions"> <button cta-text="Cancel" class="cta cta2 cancel">Cancel</button> <button cta-text="Save" class="cta save">Save</button> </div> </p> </div> <button class="display-correction">Show correction</button> </div> </div>',
                 '<div class="message clearfix"> <div class="bubble"> <div class="container-content"> <p class="text show">Hola como estas ? Me llamo heaj y hablo un poco español :) Puedes ayudarme porque hago un Erasmus en mio ultimo año :) ?</p> <p class="text-corr"><strong>¿</strong>Hola como estas ? Me llamo heaj y hablo un poco español :) <strong>¿</strong> Puedes ayudarme porque hago un Erasmus en mio ultimo año ? </p> </div> </div> <button class="display-correction show">Show correction</button> </div><div class="you message clearfix"> <a href="/profile/"><img class="mini-pic" src="../img/users/1.jpg" alt=""/></a> <div class="bubble"> <button class="edit"><img src="../img/correct.svg" alt="edit button"/></button> <div class="container-content"> <p class="text show">Yes for sure ! :) Where <strong>do you will</strong> go ?</p> <p class="text-corr">Yes for sure ! :) Where <strong>will you</strong> go ?</p> <p class="correction"> <textarea>Yes for sure ! :) Where will you go ?</textarea> <div class="actions"> <button cta-text="Cancel" class="cta cta2 cancel">Cancel</button> <button cta-text="Save" class="cta save">Save</button> </div> </p> </div> <button class="display-correction show">Show correction</button> </div> </div><div class="message clearfix"> <div class="bubble"> <div class="container-content"> <p class="text show">Voy a Torrevieja</p> </div> </div> </div><div class="you message clearfix"> <a href="/profile/"><img class="mini-pic" src="../img/users/1.jpg" alt=""/></a> <div class="bubble"> <button class="edit"><img src="../img/correct.svg" alt="edit button"/></button> <div class="container-content"> <p class="text show">Oh so cool ! I live in Orihuela, 20 km from there :D Maybe we can see each other to learn ?</p> <p class="text-corr"></p> <p class="correction"> <textarea>Oh so cool ! I live in Orihuela, 20 km from there :D Maybe we can see each other to learn ?</textarea> <div class="actions"> <button cta-text="Cancel" class="cta cta2 cancel">Cancel</button> <button cta-text="Save" class="cta save">Save</button> </div> </p> </div> <button class="display-correction">Show correction</button> </div> </div>',
                 '<div class="you message clearfix"> <a href="/profile/"><img class="mini-pic" src="../img/users/2.jpg" alt=""/></a> <div class="bubble"> <button class="edit"><img src="../img/correct.svg" alt="edit button"/></button> <div class="container-content"> <p class="text show">Hi, how are you ? I live in France and I want to improve my english, I saw you wanted to learn French, what about helping each other ?</p> <p class="text-corr"></p> <p class="correction"> <textarea>Hi, how are you ? I live in France and I want to improve my english, I saw you wanted to learn French, what about helping each other ?</textarea> <div class="actions"> <button cta-text="Cancel" class="cta cta2 cancel">Cancel</button> <button cta-text="Save" class="cta save">Save</button> </div> </p> </div> <button class="display-correction">Show correction</button> </div> </div><div class="message clearfix"> <div class="bubble"> <div class="container-content"> <p class="text show">Oui cela m\'intéresse beaucoup mais je ne <strong>parles</strong> pas bien <strong>le</strong> français.</p> <p class="text-corr">Oui cela m\'intéresse beaucoup mais je ne <strong>parle</strong> pas bien français.</p> </div> </div> <button class="display-correction show">Show correction</button> </div><div class="you message clearfix"> <a href="/profile/"><img class="mini-pic" src="../img/users/2.jpg" alt=""/></a> <div class="bubble"> <button class="edit"><img src="../img/correct.svg" alt="edit button"/></button> <div class="container-content"> <p class="text show">This is not very important because we are there to learn and my english is not perfect also.</p> <p class="text-corr"></p> <p class="correction"> <textarea>This is not very because we are there to learn and my english is not perfect also.</textarea> <div class="actions"> <button cta-text="Cancel" class="cta cta2 cancel">Cancel</button> <button cta-text="Save" class="cta save">Save</button> </div> </p> </div> <button class="display-correction">Show correction</button> </div> </div>'
        ],
        name = ["Katz18","Alvaro","Menduil"];
        $('body').on('click','.conversations button',function(e){
        $('.current').removeClass("current");
        $(this).addClass("current");


        $(this).removeClass("new-message");
        $('.chat .content-chat').html(chat[$(this).parents("li").index()]);
        $('.chat header h1').html(name[$(this).parents("li").index()]);
    });


});
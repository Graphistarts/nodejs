/**
 * Created by kevinkevers on 26/12/15.
 */
$(document).ready(function() {
    var body = $('body'),
        spokenPosition  = 0,
        learningPosition = 0,
        languages = $("#spoken_0 .language").html();
    function display_spoken_text(position){
        return '<div id="spoken_'+position+'" class="language-wrapper clearfix"><button type="button" class="delete">x</button> <div class="custom-select"> <select name="spoken-language" class="language" id="spoken-language">'+languages+'</select></div> <div class="custom-select"> <select name="level" class="level"> <option value="4">4-Advanced</option><option value="5">5-Native</option> </select></div>';

    }

    function display_learning_text(position){
        return '<div id="learning_'+position+'" class="language-wrapper clearfix"><button type="button" class="delete">x</button> <div class="custom-select"> <select class="language">'+languages+'</select></div> <div class="custom-select"> <select name="level" class="level"><option value="1">1 - Beginner</option> <option value="2">2 - Elementary</option> <option value="3"> 3 - Intermediate</option> </select> </div>';

    }
    var spoken = [],
        learning = [];

    function Language(id, language, abbr, level) {
        this.id = id;
        this.language = language;
        this.abbr = abbr;
        this.level = level;
    }
    // instanciate first element
    var langSpoken = new Language(spokenPosition,null,null,"5");
    langSpoken.id = "spoken_"+spokenPosition;
    spoken.push(langSpoken);

    var langLearning = new Language(learningPosition,null,null,"1");
    langLearning.id = "learning_"+learningPosition;
    learning.push(langLearning);

    // display explanation when marker is clicked
    $('.helper .marker').on('click',function(e){
        $('.helper .content').toggleClass("show");
    });


    // SPOKEN LANGUAGE
    $('.add-spoken-language').on('click',function(e){
        e.preventDefault();
        spokenPosition++;
        var newLanguage = new Language(spokenPosition,null,null,"4");
        newLanguage.id = "spoken_" + spokenPosition;
        spoken.push(newLanguage);
        $('.add-spoken-language').before(display_spoken_text(spokenPosition));
    });

    // DELETE A LANGUAGE
    $('.spoken-language').on('click','.delete',function(e){
        e.preventDefault();
        // remove user-side
        $(this).parent().remove();
        // search in the table to delete the right cell
        for(var i = spoken.length-1; i >= 0; i--)
            if($(this).parents().attr('id') == spoken[i].id)
                spoken.splice(i);
    });

    // SET A LANGUAGE
    body.on('change','.spoken-language .language',function(){
        for(var i = spoken.length-1; i >= 0 ; i--)
            if(spoken[i].id == $(this).parents().parents().attr('id'))
            {
                spoken[i].abbr = $(this).val();
                spoken[i].language = $(this).find(":selected").text();
            }
    });

    // SET A LANGUAGE LEVEL
    body.on('change','.spoken-language .level',function(){
        for(var i = spoken.length-1; i >= 0 ; i--)
            if(spoken[i].id == $(this).parents().parents().attr('id'))
                spoken[i].level = $(this).val();
    });



    // LEARNING LANGUAGE
    $('.add-learning-language').on('click',function(e){
        e.preventDefault();
        learningPosition++;
        var newLanguage = new Language(learningPosition,null,null,"1");
        newLanguage.id = "learning_" + learningPosition;
        learning.push(newLanguage);
        $('.add-learning-language').before(display_learning_text(learningPosition));
    });

    // DELETE A LANGUAGE
    $('.learning-language').on('click','.delete',function(e){
        e.preventDefault();
        // remove user-side
        $(this).parent().remove();
        // search in the table to delete the right cell
        for(var i = learning.length-1; i >= 0; i--)
            if($(this).parents().attr('id') == learning[i].id)
                learning.splice(i);
    });

    // SET A LANGUAGE
    body.on('change','.learning-language .language',function(){
        for(var i = learning.length-1; i >= 0 ; i--)
            if(learning[i].id == $(this).parents().parents().attr('id'))
            {
                learning[i].abbr = $(this).val();
                learning[i].language = $(this).find(":selected").text();
            }
    });

    // SET A LANGUAGE LEVEL
    body.on('change','.learning-language .level',function(){
        for(var i = learning.length-1; i >= 0 ; i--)
            if(learning[i].id == $(this).parents().parents().attr('id'))
                learning[i].level = $(this).val();

        console.log(learning);
    });

    $('.submit').on('click',function(e) {
        e.preventDefault();
        var language = {
            "spoken": spoken,
            "learning": learning
        };
        var err = "";

        if ($('#spoken_0 .language option:selected').is(':disabled'))
            err += "<p>Please select a native language</p>";
        if ($('#learning_0 .language option:selected').is(':disabled'))
            err += "<p>Please select at least one learning language</p>";

        if (err != "") {
            $('.error').html(err);
            $('.error').addClass("active");
            return false;
        }
        else {
            $.ajax({
                url: "/user-languages",
                type: "post",
                data: language,
                success: function (e) {
                    window.location.href = "/home";
                }
            })
        }
    })


});
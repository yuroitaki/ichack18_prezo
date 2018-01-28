// On document load resolve the SDK dependency
function Initialize(onComplete) {
    if (!!window.SDK) {
        document.getElementById('content').style.display = 'block';
        document.getElementById('warning').style.display = 'none';
        onComplete(window.SDK);
    }
}

// Setup the recognizer
function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {
    
    recognitionMode = SDK.RecognitionMode.Dictation;    
    var recognizerConfig = new SDK.RecognizerConfig(
        new SDK.SpeechConfig(
            new SDK.Context(
                new SDK.OS(navigator.userAgent, "Browser", null),
                new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
        recognitionMode,
        language, // Supported languages are specific to each recognition mode. Refer to docs.
        format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)
    
    var useTokenAuth = false;
    
    var authentication = function() {
        if (!useTokenAuth)
            return new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);
	
        var callback = function() {
            var tokenDeferral = new SDK.Deferred();
            try {
                var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
                xhr.open('GET', '/token', 1);
                xhr.onload = function () {
                    if (xhr.status === 200)  {
                        tokenDeferral.Resolve(xhr.responseText);
                    } else {
                        tokenDeferral.Reject('Issue token request failed.');
                    }
                };
                xhr.send();
            } catch (e) {
                window.console && console.log(e);
                tokenDeferral.Reject(e.message);
            }
            return tokenDeferral.Promise();
        }

        return new SDK.CognitiveTokenAuthentication(callback, callback);
    }();
    
    var files = document.getElementById('filePicker').files;
    if (!files.length) {
        return SDK.CreateRecognizer(recognizerConfig, authentication);
    } else {
        return SDK.CreateRecognizerWithFileAudioSource(recognizerConfig, authentication, files[0]);
    }
}

// Start the recognition
function RecognizerStart(SDK, recognizer) {
    recognizer.Recognize((event) => {
        /*
          Alternative syntax for typescript devs.
          if (event instanceof SDK.RecognitionTriggeredEvent)
        */
        switch (event.Name) {
        case "SpeechHypothesisEvent" :
            UpdateRecognizedPhrase(event.Result.Text);
            console.log(JSON.stringify(event.Result)); // check console for other information in result
            break;
        case "SpeechFragmentEvent" :
            UpdateRecognizedPhrase(event.Result.Text);
            console.log(JSON.stringify(event.Result)); // check console for other information in result
            break;
        case "SpeechEndDetectedEvent" :
            OnSpeechEndDetected();
            UpdateStatus("Processing_Adding_Final_Touches");
            console.log(JSON.stringify(event.Result)); // check console for other information in result
            break;
        case "RecognitionEndedEvent" :
            OnComplete();
            UpdateStatus("Idle");
            console.log(JSON.stringify(event)); // Debug information
            break;
        default:
            console.log(JSON.stringify(event)); // Debug information
        }
    })
        .On(() => {
            // The request succeeded. Nothing to do here.
        },
            (error) => {
                console.error(error);
            });
}

// Stop the Recognition.
function RecognizerStop(SDK, recognizer) {
    // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
    recognizer.AudioSource.TurnOff();
}

var languageOptions = "en-US";
var recognitionMode = "Dictation";
var formatOptions = "Detailed";
var key = "0e70ab8d054b45d084b2c746a8ddade7";

var startBtn, stopBtn, hypothesisDiv, phraseDiv, statusDiv;
var key, languageOptions, formatOptions, recognitionMode, inputSource, filePicker;
var SDK;
var recognizer;
var previousSubscriptionKey;
var bulk;
var box;


document.addEventListener("DOMContentLoaded", function () {
    createBtn = document.getElementById("createBtn");
    startBtn = document.getElementById("startBtn");
    stopBtn = document.getElementById("stopBtn");
    pD1 = document.getElementById("h1d");
    pD2 = document.getElementById("h2d");
    // pD3 = document.getElementById("h3d");
    // pD4 = document.getElementById("h4d");
    // pD5 = document.getElementById("h5d");
    // pD6 = document.getElementById("h6d");
    inputSource = document.getElementById("inputSource");
    filePicker = document.getElementById('filePicker');
    bulk = document.getElementById("bulk");
    box = document.getElementById("box");
    
    startBtn.addEventListener("click", function () { 
        Setup();
	RecognizerStart(SDK, recognizer);
	bulk.style.display ="none";
    box.style.display="block";
	stopBtn.style.display ="block";
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
    });    
    stopBtn.addEventListener("click", function () {
        RecognizerStop(SDK, recognizer);
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
    Initialize(function (speechSdk) {
        SDK = speechSdk;
        startBtn.disabled = false;
    });
});

function Setup() {
    if (recognizer != null) {
        RecognizerStop(SDK, recognizer);
    }
    recognizer = RecognizerSetup(SDK, recognitionMode.value, languageOptions.value, SDK.SpeechResultFormat[formatOptions.value], key);
}

function OnSpeechEndDetected() {
    stopBtn.disabled = true;
}

function OnComplete() {
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

function getRandomInt(max){
    return Math.floor(Math.random()*Math.floor(max));
}

var totallength = 0;
var rotated = false;
var smalllength = 6;
var largelength = 10;
var runone = true;
var limitlength1 = 40;
var limitlength2 = 80;
function UpdateRecognizedPhrase(json) {
    var json_result = processJson(json);
    json_result += " ";
    totallength += json_result.length;


    if (runone){
    if(totallength < limitlength1){
        //phraseDiv.innerHTML += json;
        if (json_result.length < smalllength){
            $('#h1d').append('<span id="numba2">'+json_result+'</span>');

        } else if (json_result.length >= smalllength && json_result.length < largelength){

            $('#h1d').append('<span id="numba3">'+json_result+'</span>');
        } else {
             $('#h1d').append('<span id="numba3">'+json_result+'</span>');

        }
        
    
    } else if (totallength > limitlength1 && totallength <limitlength2 && !rotated) {
       // SlideRemove();
        rotateFoo();
        if (json_result.length < smalllength){
            $('#h2d').append('<span id="numba2">'+json_result+'</span>');

        } else if (json_result.length >= smalllength && json_result.length < largelength){

            $('#h2d').append('<span id="numba3">'+json_result+'</span>');
        } else {
             $('#h2d').append('<span id="numba3">'+json_result+'</span>');

        }
        rotated = true;



    } else if (totallength > limitlength1 && totallength <limitlength2 && rotated){

       if (json_result.length < smalllength){
            $('#h2d').append('<span id="numba2">'+json_result+'</span>');

        } else if (json_result.length >= smalllength && json_result.length < largelength){

            $('#h2d').append('<span id="numba3">'+json_result+'</span>');
        } else {
             $('#h2d').append('<span id="numba3">'+json_result+'</span>');

        }

    } else if (totallength > limitlength2 && rotated){

        rotated = false;
        runone = false;
        totallength = 0;
        Disappear();
       rotateback();
    }

    } else {

        if(totallength < limitlength2){
        if (json_result.length < smalllength){
            $('#h1d').append('<span id="numba2">'+json_result+'</span>');

        } else if (json_result.length >= smalllength && json_result.length < largelength){

            $('#h1d').append('<span id="numba3">'+json_result+'</span>');
        } else {
             $('#h1d').append('<span id="numba3">'+json_result+'</span>');

        }
        } else {
            //SlideRemove();
            Disappear();
            runone = true;

            totallength = 0;

        }


    }
   
    //var pD_array = [pD1,pD2,pD3,pD4,pD5,pD6];
    //var rand_index  = getRandomInt(pD_array.length);
   // pD_array[rand_index].innerHTML += json_result + " "; 
}

function rotateFoo(){
    var angle = ($('#h1d').data('angle') - 90) || -90;
    $('#h1d').css({transform: 'rotate(-90deg) translate(-200px,-200px)'});
    $('#h1d').css('width', '600px');
    $('#h1d').data('angle', angle);
    $('#h2d').css({transform: 'translate(0px,-200px)'});
    // $('#h1d').css("transform","translate(-250px,0)");

   // var angle = ($('#h2d').data('angle') - 90) || -90;
    //$('#h2d').css({'transform': 'rotate(' + angle + 'deg)'});
    // $('#h2d').data('angle', angle);


}

function rotateback(){

    var angle = ($('#h1d').data('angle') + 90) || +90;
    $('#h1d').css({transform: 'rotate(0deg) translate(0px,0px)'});
    $('#h2d').css({transform: 'translate(0px, 0px)'});
    $('#h1d').data('angle', angle);
    $('#h1d').css('width', '100%');

}

function SlideRemove(){

        

        $("h1").slideToggle();
        $("h1").empty();
        $("h1").slideToggle();
        
}

function Disappear(){

    
        $("#h1d").empty();
        $("#h2d").empty();
        

}

function colorchange(){

        $("body").css("background-color", "yellow");
}

function processJson(json){
    
    var sep_json = json.split(" ");
    var len_json = sep_json.length;

    if((sep_json[0]=="stop")&&(sep_json[1]=="it")){
	RecognizerStop(SDK, recognizer);
	return "...";
    }
    
    if((sep_json[0]=="full")&&(sep_json[1]=="stop")){
	RecognizerStop(SDK, recognizer);
	return ".";
    }

    for(var i=0;i<len_json;i++){
	// var lower_json = sep_json[i].toLowerCase();
	switch(sep_json[i]){
	case "cat" : return "&#128049"; break;
	case "cats" : return "&#128049"; break;
	case "basketball" : return "&#127936"; break;
	case "coffee" : return "&#9749"; break;
	case "dog" : return "&#128054"; break;
	case "dogs" : return "&#128054"; break;
	case "people" : return "&#128102"; break;   
	case "pizza" : return "&#127829"; break;
	case "pizzas" : return "&#127829"; break;
	case "say" : return "&#128068"; break;
	case "talk" : return "&#128068"; break;
	case "see" : return "&#128065"; break;
	case "sunny" : return "&#127774"; break;
	case "sun" : return "&#127774"; break;
	case "tea" : return "&#127861"; break;
	case "T" : return "&#127861"; break;
	case "rain" : return "&#9748"; break;
	case "rainy" : return "&#9748"; break;
	case "football" : return "&#9917"; break;
	case "star" : return "&#9956"; break;
	case "peace" : return "&#9996"; break;
	case "piece" : return "&#9996"; break;
	case "peas" : return "&#9996"; break;
	case "music" : return "&#9835"; break;
	case "recycle" : return "&#9842"; break;
	case "balance" : return "&#9878"; break;
	case "square" : return "&#9633"; break;
	case "rectangle" : return "&#9645"; break;
	case "triangle" : return "&#9651"; break;
	case "circle" : return "&#9711"; break;
	case "wrong" : return "&#935"; break;
	case "correct" : return "&#10003"; break;
	case "bug" : return "&#128030"; break;
	case "bugs" : return "&#128030"; break;
	case "book" : return "&#128030"; break;
	case "buck" : return "&#128030"; break;
	case "bob" : return "&#128030"; break;
	case "iboc" : return "&#128030"; break;
	case "rocket" : return "&#128640"; break;
	case "car" : return "&#128663"; break;
	case "bus" : return "&#128652"; break;	    
	default: return sep_json[i]; 
	}       
    }
}



// function UpdateRecognizedHypothesis(text, append) {
//     if (append) 
//         hypothesisDiv.innerHTML += text + " ";
//     else 
//         hypothesisDiv.innerHTML = text;

//     var length = hypothesisDiv.innerHTML.length;
//     if (length > 403) {
//         hypothesisDiv.innerHTML = "..." + hypothesisDiv.innerHTML.substr(length-400, length);
//     }
// }

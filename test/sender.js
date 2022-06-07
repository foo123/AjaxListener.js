(function(){
// this is an independent script
function requestText()
{
    var xhr = new XMLHttpRequest()/*, fd = new FormData()*/;
    xhr.open('GET', './text.txt');
    xhr.setRequestHeader('X-My-Header', 'foo/bar');
    xhr.onload = function() {
        alert('LOADED TEXT: '+ xhr.responseText);
    };
    //fd.set('foo', 'bar');
    xhr.send(/*fd*/);
}
function requestJson()
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', './json.json?loo=lam&koo[ma][koo]=zoo');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        alert('LOADED JSON: '+ xhr.responseText);
    };
    xhr.send('foo=bar');
}
setTimeout(requestText, 1000);
setTimeout(requestJson, 2000);
setTimeout(requestText, 3000);
setTimeout(requestJson, 4000);
})();
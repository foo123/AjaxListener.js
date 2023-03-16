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
function requestTextFetch()
{
    fetch('./text.txt', {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: "same-origin", // include, *same-origin, omit
        //body: '',
        headers: {
          'X-My-Header': 'foo/bar'
        }
    })
    .then((response) => response.text())
    .then((responseText) => alert('LOADED TEXT: '+ responseText));
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
setTimeout(requestTextFetch, 3000);
setTimeout(requestJson, 4000);
})();
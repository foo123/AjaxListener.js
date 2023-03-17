(function(){
// this is an independent script
function textXHR()
{
    var xhr = new XMLHttpRequest()
    xhr.open('GET', './text.txt');
    xhr.setRequestHeader('X-My-Header', 'foo/bar');
    xhr.onload = function() {
        alert('LOADED XHR TEXT: '+ xhr.responseText);
    };
    xhr.send();
}
function textFetch()
{
    fetch('./text.txt', {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: "same-origin", // include, *same-origin, omit
        headers: {
          'X-My-Header': 'foo/bar'
        }
    })
    .then((response) => response.text())
    .then((responseText) => alert('LOADED FETCH TEXT: '+ responseText));
}
function jsonXHR()
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', './json.json?loo=lam&koo[ma][koo]=zoo');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        alert('LOADED XHR JSON: '+ xhr.responseText);
    };
    xhr.send('foo=bar');
}
function jsonFetch()
{
    fetch('./json.json?loo=lam&koo[ma][koo]=zoo', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: "same-origin", // include, *same-origin, omit
        body: 'foo=bar',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then((response) => response.json())
    .then((json) => alert('LOADED FETCH JSON: '+ JSON.stringify(json)));
}
function jsonfdXHR()
{
    var fd = new FormData();
    fd.append("foo", "bar");

    var xhr = new XMLHttpRequest();
    xhr.open('POST', './json.json?loo=lam&koo[ma][koo]=zoo');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        alert('LOADED XHR JSON FD: '+ xhr.responseText);
    };
    xhr.send(fd);
}
function jsonfdFetch()
{
    var fd = new FormData();
    fd.append("foo", "bar");

    var request = new Request('./json.json?loo=lam&koo[ma][koo]=zoo', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: "same-origin", // include, *same-origin, omit
        body: fd,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    fetch(request)
    .then((response) => response.json())
    .then((json) => alert('LOADED FETCH JSON FD: '+ JSON.stringify(json)));
}
// run tests
setTimeout(textXHR, 1000);
setTimeout(textFetch, 2000);
setTimeout(jsonXHR, 3000);
setTimeout(jsonFetch, 4000);
setTimeout(jsonfdXHR, 5000);
setTimeout(jsonfdFetch, 6000);
})();
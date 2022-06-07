(function(){
// this is a script that listens to any AJAX event
function mylistener(req, res)
{
    console.log('REQUEST', 'Method', req.getMethod(), 'Url', req.getUrl(), 'Headers', req.getHeaders(), 'Body', req.getBody());
    console.log('RESPONSE', 'Status', res.getStatus(), 'Headers', res.getHeaders(), 'Body', res.getBody());
}

AjaxListener.install().onRequest(mylistener);
//AjaxListener.onRequest(mylistener, false); // unlisten
//AjaxListener.uninstall(); // uninstall
})();
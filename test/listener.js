(function(){
// this is a script that listens to any AJAX event
function mylistener(req, res)
{
    console.log('REQUEST', 'API', req.getAPI(), 'Method', req.getMethod(), 'URL', req.getURL(), 'Headers', req.getHeaders(), 'Body', req.getBody());
    console.log('RESPONSE', 'API', res.getAPI(), 'Status', res.getStatus(), 'URL', res.getURL(), 'Headers', res.getHeaders(), 'Body', res.getBody());
}

AjaxListener.install().onRequest(mylistener);
//AjaxListener.onRequest(mylistener, false); // unlisten
//AjaxListener.uninstall(); // uninstall
})();
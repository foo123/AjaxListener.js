# AjaxListener.js

Listen to any AJAX event on page with JavaScript, even by other scripts

Version: 1.0.0 (5 kB minified)

**Example:**

```javascript
function mylistener(req, res)
{
    console.log('REQUEST', 'API', req.getAPI(), 'Method', req.getMethod(), 'URL', req.getURL(), 'Headers', req.getHeaders(), 'Body', req.getBody());
    console.log('RESPONSE', 'API', res.getAPI(), 'Status', res.getStatus(), 'Headers', res.getHeaders(), 'Body', res.getBody());
}

AjaxListener.install().onRequest(mylistener);

//AjaxListener.onRequest(mylistener, false); // unlisten

//AjaxListener.uninstall(); // uninstall
```

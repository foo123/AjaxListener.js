# AjaxListener.js

Listen to any AJAX event on page with JavaScript, even by other scripts

Version: 1.0.0 (5 kB minified)

**Example:**

```javascript
function mylistener(req, res)
{
    console.log('REQUEST', 'Method', req.getMethod(), 'Url', req.getUrl(), 'Headers', req.getHeaders(), 'Body', req.getBody());
    console.log('RESPONSE', 'Status', res.getStatus(), 'Headers', res.getHeaders(), 'Body', res.getBody());
}

AjaxListener.install().onRequest(mylistener);

//AjaxListener.onRequest(mylistener, false); // unlisten

//AjaxListener.uninstall(); // uninstall
```

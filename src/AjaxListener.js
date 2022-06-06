/**
*
* AjaxListener.js: listen to any AJAX event on page, even by other scripts
* version 1.0.0
* https://github.com/foo123/AjaxListener.js
*
**/
!function(root, name, factory) {
"use strict";
root[name] = factory();
if ('function' === typeof define && define.amd) define(function(req) {return root[name];});
}('undefined' !== typeof self ? self : this, 'AjaxListener', function() {
"use strict";

var AjaxListener = {VERSION: '1.0.0'},
    callbacks = [], installed = false,
    FETCH = window.fetch,
    XHR = window.XMLHttpRequest,
    xhrOpen, xhrSend
;

function notify(obj)
{
    for (var cb=callbacks.slice(), i=0, n=cb.length; i<n; ++i) cb[i](obj);
}

AjaxListener.install = function() {
    if (!installed)
    {
        installed = true;
        if (FETCH)
        {
            window.fetch = function(url, options) {
                var obj = {type:'fetch', method:'GET', url: url, data: null, status:0, response:'', options:options};
                return FETCH(url, options).then(function(response) {
                    if (callbacks.length)
                    {
                        response.text().then(function(responseText) {
                            obj.status = response.status;
                            obj.response = responseText;
                            if (url instanceof window.Request)
                            {
                                obj.method = url.method.toUpperCase();
                                obj.url = url.url;
                                if ('POST' === obj.method)
                                {
                                    url.text().then(function(d) {
                                        obj.data = d;
                                        notify(obj);
                                    });
                                }
                                else
                                {
                                    notify(obj);
                                }
                            }
                            else
                            {
                                notify(obj);
                            }
                        });
                    }
                    return response;
              });
            };
        }
        if (XHR)
        {
            xhrOpen = XHR.prototype.open;
            xhrSend = XHR.prototype.send;
            XHR.prototype.open = function(m, u) {
                var self = this,
                    obj = {type:'xhr', method:'GET', url:'', data: null, status:0, response:''};
                if (arguments.length < 1) m = 'GET';
                if (arguments.length < 2) u = '';
                obj.method = String(m).toUpperCase();
                obj.url = u;
                self.__ = obj;
                self.addEventListener('load', function onLoad() {
                    self.removeEventListener('load', onLoad);
                    self.__ = null;
                    obj.status = self.status;
                    obj.response = self.responseText;
                    if (callbacks.length) notify(obj);
                });
                xhrOpen.apply(self, arguments);
            };
            XHR.prototype.send = function(d) {
                var self = this, obj = self.__ || {};
                if (arguments.length < 1) d = '';
                if ('POST' === obj.method) obj.data = d;
                xhrSend.apply(self, arguments);
            };
        }
    }
    return AjaxListener;
};

AjaxListener.isInstalled = function() {
    return installed;
};

AjaxListener.uninstall = function() {
    if (installed)
    {
        if (FETCH) window.fetch = FETCH;
        if (XHR) {XHR.prototype.open = xhrOpen; XHR.prototype.send = xhrSend;}
        xhrOpen = null;
        xhrSend = null;
        installed = false;
    }
    return AjaxListener;
};

AjaxListener.onRequest = function(callback, add) {
    if ('function' === typeof callback)
    {
        var i = callbacks.indexOf(callback);
        if (false === add)
        {
            if (-1 !== i) callbacks.splice(i, 1);
        }
        else
        {
            if (-1 === i) callbacks.push(callback);
        }
    }
    return AjaxListener;
};

return AjaxListener;
});
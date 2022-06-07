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
    HAS = Object.prototype.hasOwnProperty, NL = /[\r\n]+/,
    fetch = window.fetch, xhr = window.XMLHttpRequest, xhrOpen
;

function parse_url_params(params)
{
    return String(params).trim().split('&').reduce(function(o, kv){
        kv = kv.split('=');
        var key = kv[0].length ? decodeURIComponent(kv[0]) : null,
            val = kv[1] && kv[1].length ? decodeURIComponent(kv[1]) : true;
        if (key)
        {
            if (HAS.call(o, key))
            {
                if (o[key].push) o[key].push(val);
                else o[key] = [o[key], val];
            }
            else
            {
                o[key] = val;
            }
        }
        return o;
    }, {});
}
function parse_headers(headers)
{
    return String(headers).trim().split(NL).reduce(function(o, line) {
        line = line.trim();
        if (line.length)
        {
            var parts = line.split(': '), header = parts.shift(), value = parts.join(': ');
            o[header] = value;
        }
        return o;
    }, {});
}

function notify(req, res)
{
    setTimeout(function() {
        for (var cb=callbacks.slice(), i=0, n=cb.length; i<n; ++i) cb[i](req, res);
        req.dispose(); res.dispose();
    }, 0);
}

function Request(type)
{
    this.type = type;
}
Request.prototype = {
    constructor: Request,

    type: '',
    _method: 'GET',
    _url: null,
    _headers: null,
    _body: null,

    dispose: function() {
        this._method = null;
        this._url = null;
        this._headers = null;
        this._body = null;
        return this;
    },

    setMethod: function(method) {
        this._method = String(method).toUpperCase();
        return this;
    },
    getMethod: function() {
        return this._method;
    },

    setUrl: function(url) {
        this._url = url;
        return this;
    },
    getUrl: function(raw) {
        var url = this._url, parts;
        if (true === raw) return url;
        if (url)
        {
            parts = url.split('?');
            if (parts[1])
            {
                parts[1] = parts[1].split('#');
                if (parts[1][1])
                {
                    return {url:parts[0], search:parse_url_params(parts[1][0]), hash:parts[1][1]};
                }
                else
                {
                    return {url:parts[0], search:parse_url_params(parts[1][0]), hash:null};
                }
            }
            else
            {
                parts[0] = parts[0].split('#');
                if (parts[0][1])
                {
                    return {url:parts[0][0], search:null, hash:parts[0][1]};
                }
                else
                {
                    return {url:url, search:null, hash:null};
                }
            }
        }
    },

    setHeaders: function(headers) {
        this._headers = headers;
        return this;
    },
    getHeaders: function(raw) {
        var headers = this._headers;
        if (true === raw) return headers;
        if (headers)
        {
            return headers.keys && header.get ? Array.from(headers.keys()).reduce(function(o, k) {
                o[k] = headers.get(k);
                return o;
            }, {}) : (headers.substring ? parse_headers(headers) : headers);
        }
    },

    setBody: function(body) {
        this._body = body;
        return this;
    },
    getBody: function(format) {
        var body = this._body;
        if (true === format) return body;
        if (body)
        {
            return window.FormData && (body instanceof window.FormData) ? Array.from(body.keys()).reduce(function(o, k) {
               o[k] = body.getAll(k);
               return o;
            }, {}) : ('json' === format ? JSON.parse(body) : ('urlenc' === format ? parse_url_params(body) : body));
        }
    }
};
AjaxListener.Request = Request;

function Response(type)
{
    this.type = type;
}
Response.prototype = {
    constructor: Response,

    type: '',
    _status: 0,
    _headers: null,
    _body: null,

    dispose: function() {
        this._status = null;
        this._headers = null;
        this._body = null;
        return this;
    },

    setStatus: function(status) {
        this._status = status;
        return this;
    },
    getStatus: function() {
        return this._status;
    },

    setHeaders: function(headers) {
        this._headers = headers;
        return this;
    },
    getHeaders: function(raw) {
        var headers = this._headers;
        if (true === raw) return headers;
        if (headers)
        {
            return headers.keys && header.get ? Array.from(headers.keys()).reduce(function(o, k) {
                o[k] = headers.get(k);
                return o;
            }, {}) : (headers.substring ? parse_headers(headers) : headers);
        }
    },

    setBody: function(body) {
        this._body = body;
        return this;
    },
    getBody: function() {
        return this._body;
    }
};
AjaxListener.Response = Response;


function listenerFetch(url)
{
    return fetch.apply(fetch, arguments).then(function(response) {
        if (callbacks.length)
        {
            var req = new Request('fetch'), res = new Response('fetch');
            response.text().then(function(responseText) {
                res
                    .setStatus(response.status)
                    .setHeaders(response.headers)
                    .setBody(responseText)
                ;
                if (url instanceof window.Request)
                {
                    req
                        .setMethod(url.method)
                        .setUrl(url.url)
                        .setHeaders(url.headers)
                    ;
                    url.text().then(function(reqBody) {
                        req.setBody(reqBody)
                        notify(req, res);
                    });
                }
                else
                {
                    req
                        .setMethod('GET')
                        .setUrl(url)
                    ;
                    notify(req, res);
                }
            });
        }
        return response;
  });
}
listenerFetch.ajaxListener = AjaxListener;

function listenerOpen(method, url)
{
    var self = this, body = null, headers = {},
        xhrSend = xhr.prototype.send,
        xhrSetRequestHeader = xhr.prototype.setRequestHeader;

    self.send = function(payload) {
        if (arguments.length < 1) payload = null;
        body = payload;
        xhrSend.apply(self, arguments);
    };
    self.setRequestHeader = function(header, value) {
        headers[header] = HAS.call(headers, header) ? (headers[header]+', '+String(value)) : String(value);
        xhrSetRequestHeader.apply(self, arguments);
    };

    if (arguments.length < 1) method = 'GET';
    if (arguments.length < 2) url = '';

    self.addEventListener('load', function onLoad() {
        self.removeEventListener('load', onLoad);
        if (callbacks.length)
        {
            var req = new Request('xhr'), res = new Response('xhr');
            req
                .setMethod(method)
                .setUrl(url)
                .setHeaders(headers)
                .setBody(body)
            ;
            res
                .setStatus(self.status)
                .setHeaders(self.getAllResponseHeaders())
                .setBody(self.responseText)
            ;
            notify(req, res);
        }
    });
    xhrOpen.apply(self, arguments);
}
listenerOpen.ajaxListener = AjaxListener;

AjaxListener.install = function() {
    if (!installed)
    {
        installed = true;
        if (fetch)
        {
            if (fetch.ajaxListener)
            {
                fetch.ajaxListener.uninstall();
                fetch = window.fetch;
            }
            window.fetch = listenerFetch;
        }
        if (xhr)
        {
            if (xhr.prototype.open.ajaxListener)
            {
                xhr.prototype.open.ajaxListener.uninstall();
            }
            xhrOpen = xhr.prototype.open;
            xhr.prototype.open = listenerOpen;
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
        if (fetch) window.fetch = fetch;
        if (xhr) xhr.prototype.open = xhrOpen;
        xhrOpen = null;
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
            if (-1 !== i)
                callbacks.splice(i, 1);
        }
        else
        {
            if (-1 === i)
                callbacks.push(callback);
        }
    }
    return AjaxListener;
};

return AjaxListener;
});
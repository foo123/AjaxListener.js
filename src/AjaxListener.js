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
function extract_form_data(fd)
{
    return Array.from(fd.keys()).reduce(function(o, k) {
       o[k] = fd.getAll(k);
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
            o[header.toLowerCase()] = value;
        }
        return o;
    }, {});
}
function extract_headers(headers)
{
    return Array.from(headers.keys()).reduce(function(o, k) {
        o[k.toLowerCase()] = headers.get(k);
        return o;
    }, {});
}

function factory(f, x)
{
    return 'function' === typeof f ? function() {return f(x);} : function() {return x;};
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

    setHeaders: function(headersFactory) {
        this._headers = headersFactory;
        return this;
    },
    getHeaders: function() {
        var headersFactory = this._headers;
        if (headersFactory) return headersFactory();
    },

    setBody: function(body) {
        this._body = body;
        return this;
    },
    getBody: function(raw) {
        var body = this._body;
        if (true === raw) return body;
        if (body)
        {
            if (window.FormData && (body instanceof window.FormData))
            {
                return extract_form_data(body);
            }
            var contentType = String(this.getHeaders()['content-type'] || '');
            if (-1 !== contentType.indexOf('application/x-www-form-urlencoded'))
            {
                return parse_url_params(body);
            }
            if (-1 !== contentType.indexOf('application/json') || -1 !== contentType.indexOf('application/vnd.api+json'))
            {
                return JSON.parse(body);
            }
            return body;
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

    setHeaders: function(headersFactory) {
        this._headers = headersFactory;
        return this;
    },
    getHeaders: function() {
        var headersFactory = this._headers;
        if (headersFactory) return headersFactory();
    },

    setBody: function(body) {
        this._body = body;
        return this;
    },
    getBody: function(raw) {
        var body = this._body;
        if (true === raw) return body;
        if (body)
        {
            var contentType = String(this.getHeaders()['content-type'] || '');
            if (-1 !== contentType.indexOf('application/json') || -1 !== contentType.indexOf('application/vnd.api+json'))
            {
                return JSON.parse(body);
            }
            return body;
        }
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
                    .setHeaders(factory(extract_headers, response.headers))
                    .setBody(responseText)
                ;
                if (url instanceof window.Request)
                {
                    req
                        .setMethod(url.method)
                        .setUrl(url.url)
                        .setHeaders(factory(extract_headers, url.headers))
                    ;
                    url.text().then(function(reqBody) {
                        req.setBody(reqBody || '')
                        notify(req, res);
                    });
                }
                else
                {
                    req
                        .setMethod('GET')
                        .setUrl(url)
                        .setHeaders(factory(null, {}))
                        .setBody('')
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

    self.send = function() {
        if (arguments.length) body = arguments[0];
        xhrSend.apply(self, arguments);
    };
    self.setRequestHeader = function(header, value) {
        var h = String(header).toLowerCase();
        headers[h] = HAS.call(headers, h) ? (headers[h]+', '+String(value)) : String(value);
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
                .setHeaders(factory(null, headers))
                .setBody(null == body ? '' : body)
            ;
            res
                .setStatus(self.status)
                .setHeaders(factory(parse_headers, self.getAllResponseHeaders()))
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
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
    HAS = Object.prototype.hasOwnProperty, FtoString = Function.prototype.toString,
    NL = /[\r\n]+/,
    NESTED = /^[^\[\]\.]+(\[[^\[\]\.]+\])+(\[\])?$/,
    BRAKET = /\[([^\[\]]+)\]/g,
    NATIVE_CODE = /^\s*function\s*[A-Za-z0-9_$]+\s*\([^\(\)]*\)\s*\{\s*\[native code\]\s*\}\s*$/i,
    fetch = window.fetch,
    xhr = window.XMLHttpRequest, xhrOpen
;

function get_base_url()
{
    return window.location.origin + window.location.pathname/*.split('/').slice(0, -1).join('/')*/;
}
function is_native_function(f)
{
    return ('function' === typeof f) && NATIVE_CODE.test(FtoString.call(f));
}
function is_formdata(x)
{
    return window.FormData && (x instanceof window.FormData);
}
function decode_key(key)
{
    return NESTED.test(key) ? key.replace(BRAKET, ".$1").split('.').map(function(k) {return decodeURIComponent(k);}) : [decodeURIComponent(key)];
}
function insert_key(o, key, val)
{
    for (var k, i=0, l=key.length; i<l; ++i)
    {
        k = key[i];
        if (i+1 < l)
        {
            if (!HAS.call(o, k)) o[k] = {};
            o = o[k];
        }
        else
        {
            if ('[]' === k.slice(-2)) k = k.slice(0, -2);
            if (HAS.call(o, k))
            {
                if (o[k].push) o[k].push(val);
                else o[k] = [o[k], val];
            }
            else
            {
                o[k] = val;
            }
        }
    }
}
function parse_url_params(params, obj)
{
    return String(params).trim().split('&').reduce(function(o, kv){
        kv = kv.split('=');
        var key = kv[0].length ? decode_key(kv[0]) : null;
        if (key && key.length)
            insert_key(o, key, kv[1] ? (kv[1].length ? decodeURIComponent(kv[1]) : '') : true);
        return o;
    }, obj || {});
}
function parse_json(jsonStr)
{
    return JSON.parse(jsonStr);
}
function extract_form_data(fd, obj)
{
    return Array.from(fd.keys()).reduce(function(o, k) {
       var v = fd.getAll(k);
       o[k] = 1 === v.length ? v[0] : v;
       return o;
    }, obj || {});
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

function Request(api, method, _url, _headersFactory, _body)
{
    var self = this, url = null, headers = null, body = null;
    method = String(method).toUpperCase();

    self.dispose = function() {
        _url = null;
        _headersFactory = null;
        _body = null;
        method = null;
        url = null;
        headers = null;
        body = null;
        return self;
    };
    self.getAPI = function() {
        return api;
    };
    self.getMethod = function() {
        return method;
    };
    self.getURL = function(raw) {
        if (true === raw) return _url;
        if (null == url && null != _url)
        {
            var u = new window.URL(_url, get_base_url());
            url = {
                href: u.href,
                origin: u.origin,
                hostname: u.hostname,
                protocol: u.protocol,
                host: u.host,
                port: u.port,
                path: u.pathname,
                query: u.search,
                hash: u.hash,
                queryParams: u.search && u.search.length ? parse_url_params(u.search.slice(1)) : {}
            };
            /*
            // NOT ADDED AS QUERY PARAMS!!
            if (('GET' === self.getMethod()) && is_formdata(self.getBody(true)))
            {
                url.queryParams = extract_form_data(self.getBody(true), url.queryParams);
            }*/
        }
        return url;
    };
    self.getHeaders = function() {
        if (null == headers && null != _headersFactory)
        {
            headers = _headersFactory();
        }
        return headers;
    };
    self.getBody = function(raw) {
        if (true === raw) return _body;
        if (null == body && null != _body)
        {
            if (is_formdata(_body))
            {
                return body = extract_form_data(_body);
            }
            var contentType = String(self.getHeaders()['content-type'] || '');
            if (-1 !== contentType.indexOf('application/x-www-form-urlencoded'))
            {
                body = parse_url_params(_body);
            }
            else if (
                -1 !== contentType.indexOf('application/json')
                || -1 !== contentType.indexOf('application/vnd.api+json')
            )
            {
                body = parse_json(_body);
            }
            else
            {
                body = _body;
            }
        }
        return body;
    };
}
Request.prototype = {
    constructor: Request
    ,dispose: null
    ,getAPI: null
    ,getMethod: null
    ,getURL: null
    ,getHeaders: null
    ,getBody: null
};
AjaxListener.Request = Request;

function Response(api, status, _headersFactory, _body)
{
    var self = this, headers = null, body = null;

    self.dispose = function() {
        status = null;
        _headersFactory = null;
        _body = null;
        headers = null;
        body = null;
        return self;
    };
    self.getAPI = function() {
        return api;
    };
    self.getStatus = function() {
        return status;
    };
    self.getHeaders = function() {
        if (null == headers && null != _headersFactory)
        {
            headers = _headersFactory();
        }
        return headers;
    };
    self.getBody = function(raw) {
        if (true === raw) return _body;
        if (null == body && null != _body)
        {
            var contentType = String(self.getHeaders()['content-type'] || '');
            if (-1 !== contentType.indexOf('application/x-www-form-urlencoded'))
            {
                body = parse_url_params(_body);
            }
            else if (
                -1 !== contentType.indexOf('application/json')
                || -1 !== contentType.indexOf('application/vnd.api+json')
            )
            {
                body = parse_json(_body);
            }
            else
            {
                body = _body;
            }
        }
        return body;
    };
}
Response.prototype = {
    constructor: Response
    ,dispose: null
    ,getAPI: null
    ,getStatus: null
    ,getHeaders: null
    ,getBody: null
};
AjaxListener.Response = Response;


function listenerFetch(url)
{
    return fetch.apply(fetch, arguments).then(function(response) {
        if (callbacks.length)
        {
            response.text().then(function(responseText) {
                var req, res;
                res = new Response('fetch', response.status, factory(extract_headers, response.headers), responseText);
                if (url instanceof window.Request)
                {
                    url.text().then(function(reqBody) {
                        req = new Request('fetch', url.method, url.url, factory(extract_headers, url.headers), reqBody || '');
                        notify(req, res);
                    });
                }
                else
                {
                    req = new Request('fetch', 'GET', url, factory(null, {}), '');
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
        xhrSend = self.send,
        xhrSetRequestHeader = self.setRequestHeader;

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
            var req = new Request('xhr', method, url, factory(null, headers), null == body ? '' : body),
                res = new Response('xhr', self.status, factory(parse_headers, self.getAllResponseHeaders()), self.responseText);
            notify(req, res);
        }
    });
    xhrOpen.apply(self, arguments);
}
listenerOpen.ajaxListener = AjaxListener;

AjaxListener.install = function() {
    if (!installed)
    {
        if (fetch)
        {
            if (fetch.ajaxListener)
            {
                fetch.ajaxListener.uninstall();
                fetch = window.fetch;
            }
            if (is_native_function(fetch))
            {
                window.fetch = listenerFetch;
                installed = true;
            }
        }
        if (xhr)
        {
            if (xhr.prototype.open.ajaxListener)
            {
                xhr.prototype.open.ajaxListener.uninstall();
            }
            if (is_native_function(xhr.prototype.open))
            {
                xhrOpen = xhr.prototype.open;
                xhr.prototype.open = listenerOpen;
                installed = true;
            }
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
        if (is_native_function(fetch)) window.fetch = fetch;
        if (is_native_function(xhrOpen)) xhr.prototype.open = xhrOpen;
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
/**
*
* AjaxListener.js: listen to any AJAX event on page, even by other scripts
* version 1.1.0
* https://github.com/foo123/AjaxListener.js
*
**/
!function(root, name, factory) {
"use strict";
root[name] = factory();
if ('function' === typeof define && define.amd) define(function(req) {return root[name];});
}('undefined' !== typeof self ? self : this, 'AjaxListener', function(undef) {
"use strict";

var AjaxListener = {VERSION: '1.1.0'},
    callbacks = [], installed = false,
    HAS = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    FtoString = Function.prototype.toString,
    NL = /[\r\n]+/,
    NESTED = /^[^\[\]\.]+(\[[^\[\]\.]+\])+(\[\])?$/,
    BRAKET = /\[([^\[\]]+)\]/g,
    NATIVE_CODE = /^\s*function\s*[A-Za-z0-9_$]+\s*\([^\(\)]*\)\s*\{\s*\[native code\]\s*\}\s*$/i,
    fetch = window.fetch,
    xhr = window.XMLHttpRequest,
    xhrOpen, xhrSend, xhrSetRequestHeader
;

function get_base_url()
{
    return window.location.origin + window.location.pathname;
}
function is_string(x)
{
    return '[object String]' === toString.call(x);
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
function get_headers(headers)
{
    return ('function' === typeof headers.keys) && ('function' === typeof headers.get) ? extract_headers(headers) : Object.keys(headers).reduce(function(o, k) {
        o[k.toLowerCase()] = headers[k];
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
        req = null; res = null;
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
                body = extract_form_data(_body);
            }
            else if (is_string(_body))
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

function Response(api, status, _url, _headersFactory, _body)
{
    var self = this, url = null, headers = null, body = null;

    self.dispose = function() {
        status = null;
        _url = null;
        _headersFactory = null;
        _body = null;
        url = null;
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
            if (is_string(_body))
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
    ,getURL: null
    ,getHeaders: null
    ,getBody: null
};
AjaxListener.Response = Response;


function listenerFetch(request)
{
    var args = arguments, options = (1 < args.length ? args[1] : {}) || {};
    return new Promise(function(resolve, reject) {
        fetch.apply(window, args).then(function(response) {
            resolve(response);
            if (callbacks.length)
            {
                notify(
                request instanceof window.Request
                ? new Request('fetch', request.method, request.url, factory(extract_headers, request.headers), request.body)
                : new Request('fetch', options.method || 'GET', request, factory(get_headers, options.headers || {}), options.body || ''),
                new Response('fetch', response.status, response.url || request.url, factory(extract_headers, response.headers), response.body)
                );
            }
        }).catch(function(err) {
            reject(err);
        });
    });
}
listenerFetch.ajaxListener = AjaxListener;

function listenerOpen(method, url)
{
    var self = this, body = null, headers = {}, done;

    self.send = function() {
        if (arguments.length) body = arguments[0];
        return xhrSend.apply(self, arguments);
    };
    self.setRequestHeader = function(header, value) {
        var h = String(header).toLowerCase();
        headers[h] = HAS.call(headers, h) ? (headers[h]+', '+String(value)) : String(value);
        return xhrSetRequestHeader.apply(self, arguments);
    };
    done = function done(evt) {
        self.removeEventListener('load', done);
        self.removeEventListener('error', done);
        self.removeEventListener('abort', done);
        if (('load' === evt.type) && callbacks.length)
        {
            notify(
            new Request('xhr', method, url, factory(null, headers), null == body ? '' : body),
            new Response('xhr', self.status, self.responseURL && self.responseURL.length ? self.responseURL : url, factory(parse_headers, self.getAllResponseHeaders()), self.responseText)
            );
        }
    };
    self.addEventListener('load', done);
    self.addEventListener('error', done);
    self.addEventListener('abort', done);

    if (arguments.length < 1) method = 'GET';
    if (arguments.length < 2) url = '';
    return xhrOpen.apply(self, arguments);
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
                xhrSend = xhr.prototype.send;
                xhrSetRequestHeader = xhr.prototype.setRequestHeader;
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
        xhrSend = null;
        xhrSetRequestHeader = null;
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
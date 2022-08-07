# AjaxListener.js

Listen to any AJAX event on page with JavaScript, even by other scripts

Version: **1.0.0** (5 kB minified)

![AJAX Listener](/ajaxlistener.jpg)

**Example:**

```javascript
function mylistener(req, res)
{
    console.log('REQUEST', 'API', req.getAPI(), 'Method', req.getMethod(), 'URL', req.getURL(), 'Headers', req.getHeaders(), 'Body', req.getBody());
    console.log('RESPONSE', 'API', res.getAPI(), 'Status', res.getStatus(), 'URL', res.getURL(), 'Headers', res.getHeaders(), 'Body', res.getBody());
}

AjaxListener.install().onRequest(mylistener);

//AjaxListener.onRequest(mylistener, false); // unlisten

//AjaxListener.uninstall(); // uninstall
```

**see also:**

* [ModelView](https://github.com/foo123/modelview.js) a simple, fast, powerful and flexible MVVM framework for JavaScript
* [Contemplate](https://github.com/foo123/Contemplate) a fast and versatile isomorphic template engine for PHP, JavaScript, Python
* [HtmlWidget](https://github.com/foo123/HtmlWidget) html widgets, made as simple as possible, both client and server, both desktop and mobile, can be used as (template) plugins and/or standalone for PHP, JavaScript, Python (can be used as [plugins for Contemplate](https://github.com/foo123/Contemplate/blob/master/src/js/plugins/plugins.txt))
* [Paginator](https://github.com/foo123/Paginator)  simple and flexible pagination controls generator for PHP, JavaScript, Python
* [ColorPicker](https://github.com/foo123/ColorPicker) a fully-featured and versatile color picker widget
* [Pikadaytime](https://github.com/foo123/Pikadaytime) a refreshing JavaScript Datetimepicker that is ightweight, with no dependencies
* [Timer](https://github.com/foo123/Timer) count down/count up JavaScript widget
* [InfoPopup](https://github.com/foo123/InfoPopup) a simple JavaScript class to show info popups easily for various items and events (Desktop and Mobile)
* [Popr2](https://github.com/foo123/Popr2) a small and simple popup menu library
* [area-select.js](https://github.com/foo123/area-select.js) a simple JavaScript class to select rectangular regions in DOM elements (image, canvas, video, etc..)
* [area-sortable.js](https://github.com/foo123/area-sortable.js) simple and light-weight JavaScript class for handling smooth drag-and-drop sortable items of an area (Desktop and Mobile)
* [css-color](https://github.com/foo123/css-color) simple class for manipulating color values and color formats for css, svg, canvas/image
* [jquery-plugins](https://github.com/foo123/jquery-plugins) a collection of custom jQuery plugins
* [jquery-ui-widgets](https://github.com/foo123/jquery-ui-widgets) a collection of custom, simple, useful jQueryUI Widgets
* [touchTouch](https://github.com/foo123/touchTouch) a variation of touchTouch jQuery Optimized Mobile Gallery in pure vanilla JavaScript
* [Imagik](https://github.com/foo123/Imagik) fully-featured, fully-customisable and extendable Responsive CSS3 Slideshow
* [Carousel3](https://github.com/foo123/Carousel3) HTML5 Photo Carousel using Three.js
* [Rubik3](https://github.com/foo123/Rubik3) intuitive 3D Rubik Cube with Three.js
* [MOD3](https://github.com/foo123/MOD3) JavaScript port of AS3DMod ActionScript 3D Modifier Library
* [RT](https://github.com/foo123/RT) unified client-side real-time communication for JavaScript using XHR polling / BOSH / WebSockets / WebRTC
* [AjaxListener.js](https://github.com/foo123/AjaxListener.js): Listen to any AJAX event on page with JavaScript, even by other scripts
* [asynchronous.js](https://github.com/foo123/asynchronous.js) simple manager for asynchronous, linear, parallel, sequential and interleaved tasks for JavaScript
* [classy.js](https://github.com/foo123/classy.js) Object-Oriented mini-framework for JavaScript


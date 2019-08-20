const http = require('http')
const url = require("url")
const qs = require("querystring")
const Cookies = require('cookies')
const httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
const proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {

  let queryObj = qs.parse(url.parse(req.url).query)
  let cookies = new Cookies(req, res)
  let target = req.headers['x-proxy-target'] || cookies.get('x-proxy-target') || queryObj['x-proxy-target']
  if (!target) {
    res.write('please set header, cookie or query field [x-proxy-target] for your target host')
    res.end()
  } else {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    proxy.web(req, res, { target, changeOrigin: true });
  }
});

console.log("listening on port 5050")
server.listen(3099);

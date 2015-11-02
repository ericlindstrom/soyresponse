# soyresponse

| Project Name   | Status |
|----------------|--------|
| soyresponse    | Draft  |

Render soy templates in express

Example: [ericlindstrom/soyresponse-example](https://github.com/ericlindstrom/soyresponse-example)

### NPM:

    npm install ericlindstrom/soyresponse --save

### app.js

    //...
    var app = express();

    /**
     *  1. require soyresponse 
     */
    var soyresponse = require('soyresponse');

    /**
     *  2. Add soyresponse middleware with template directory and options
     */
    var soyResponseOptions = {
      allowJson: true,
      xssiPrefix: '])}while(1);</x>',
      removeFromJson: ['GLOBAL'],
      usePayload: true
    };
    app.use(soyresponse(__dirname, soyResponseOptions));
 
### Options

`templateDir` - Compiles and loads all .soy files in the directory.

`options.allowJson` - When request is XHR, allow JSON

`options.xssiPrefix` - http://goo.gl/fdgn7p

`options.removeFromJson` - Remove objects from JSON that you may not need, such as a global context variable.

`options.usePayload` - Moves res.locals and options into a `payload` object. Useful when using closure compilers' `ADVANCED` mode with client side templating.

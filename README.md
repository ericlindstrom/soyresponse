# soyresponse

| Project Name   | Status |
|----------------|--------|
| soyresponse    | Draft  |

Render soy templates in express

NPM:

    npm install soynode soyresponse --save

app.js

    //...
    var app = express();

    /**
     *  1. require soyresponse 
     */
    var soyresponse = require('soyresponse');

    /**
     *  2. Add soyresponse middleware with application directory and options
     */
    var soyResponseOptions = {
      allowJson: true,
      xssiPrefix: '])}while(1);</x>'
    };
    app.use(soyresponse(__dirname, soyResponseOptions));
 

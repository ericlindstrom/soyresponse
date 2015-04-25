# soyresponse

| Project Name   | Status |
|----------------|--------|
| soyresponse    | Draft  |



render soy templates in express

    /**
     *  1. require soynode and soyresponse 
     */
    var soynode = require('soynode');
    var soyresponse = require('soyresponse');
    
    
    /**
     *  2. Set options for soynode templating
     */
    soynode.setOptions({
      allowDynamicRecompile: true,
      uniqueDir: false
    });
    soynode.compileTemplates(__dirname);
    
    
    /**
     *  3. Add soyresponse middleware with options
     */
    var soyResponseOptions = {
      allowJson: true,
      xssiPrefix: '])}while(1);</x>'
    };
    app.use(soyresponse(soyResponseOptions));
 

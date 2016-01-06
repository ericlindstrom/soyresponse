var extend = require('extend'),
    soynode = require('soynode'),
    path = require('path');


/**
 *  Renders the soy template or JSON depending on options.
 *
 *  @method soyResponse
 *  @param {string} templateDir - Compiles and loads all .soy files in the directory.
 *  @param {string=} options.allowJson - When request is XHR, allow JSON
 *  @param {string=} options.xssiPrefix - http://goo.gl/fdgn7p
 *  @param {array=} options.removeFromJson - Remove objects from JSON that you may
 *    not need, such as a global context variable.
 */
function soyResponse(templateDir, options) {
  if (!templateDir) {
    return next(new Error('the first argument (templateDir) should be `__dirname`'));
  };

  function soyresponseLog(message) {
    return console.log(['soyresponse', message].join(': '));
  }


  /**
   * if we're in production and want to load from precompiled templates, set
   * `options.buildDir` which will be a relative file. Otherwise, we're in
   * development and assuming dynamic recompile.
   */
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production' && options.buildDir) {
    var buildDir_ = path.join(process.cwd(), options.buildDir);

    soyresponseLog('loading templates from `'+ buildDir_ + '`');
    soynode.loadCompiledTemplates(buildDir_, function(err, success) {
      if (err) { 
        soyresponseLog('error loading templates'); 
        return;
      }
      soyresponseLog('templates loaded');
    });

  } else {
    soynode.setOptions({
      allowDynamicRecompile: true,
      uniqueDir: false
    });

    soynode.compileTemplates(templateDir);
  }

  /**
   *  Set defaults
   */
  var defaults_ = {
    useJson: options && options.allowJson ? options.allowJson : false,
    xssiPrefix: options && options.xssiPrefix ? options.xssiPrefix : null,
    removeFromJson: options && options.removeFromJson ? options.removeFromJson : [],
    usePayload: options && options.usePayload ? options.usePayload : false
  };

  return function(req, res, next) {

    /**
     *  Stash original render as defaultRender
     */
    res.defaultRender = res.render;


    /**
     *  Render soy template.
     *
     *  @method renderSoy
     *  @param self
     *  @param view
     *  @param options
     *  @private
     */
    function renderSoy_(self, view, options) {
      var options_ = extend({}, self.req.app.locals);

      if (!defaults_.usePayload) { 
        options_ = extend(options_, self.req.res.locals, options); 
      } else {
        options_.payload = extend({}, self.req.res.locals, options);
      }

      delete options_.settings;

      return soynode.render(view, options_);
    };


    /**
     *  Default soy render.
     *
     *  @method soy
     *  @param {Object} view
     *  @param {Object} options
     */
    res.soy = function(view, options) {
      var self = this;
      self.send(renderSoy_(self, view, options));
    };


    /**
     *  Responds with the default soy response if a non-Xhr, otherwise it
     *  returns JSON with an optional XSSI prefix.
     *
     *  @method soyOrJson
     *  @param {Object} view
     *  @param {Object} options
     */
    res.soyOrJson = function(view, options) {
      var self = this,
          data;

      if (!req.xhr) {
        data = renderSoy_(self, view, options);
      } else {
        var options_ = extend({}, self.req.app.locals);

        if (!defaults_.usePayload) { 
          options_ = extend(options_, self.req.res.locals, options); 
        } else {
          options_.payload = extend({}, self.req.res.locals, options);
        }

        delete options_.settings;

        defaults_.removeFromJson.forEach(function(obj) {
          delete options_[obj];
        });

        self.set('Content-type', 'application/json');
        data = [defaults_.xssiPrefix, JSON.stringify(options_)].join('');
      }

      self.send(data);
    };


    /**
     *  Overwrite default render.
     *
     *  @method render
     *  @param {Object} view
     *  @param {Object} options
     */
    res.render = function(view, options) {
      var self = this,
          renderer = defaults_.useJson ? 'soyOrJson' : 'soy';

      self[renderer](view, options);
    };

    next();
  };
};

module.exports = soyResponse;

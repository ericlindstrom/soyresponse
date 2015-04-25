var soynode = require('soynode'),
    extend = require('extend');

/**
 *  Renders the soy template.
 *
 *  @method soyresponse
 *  @param {string} options.allowJson
 *  @param {string} options.xssiPrefix
 */
function soyResponse(options) {
  /** 
   *  set defaults
   */
  var defaults_ = {
    useJson: options && options.allowJson ? options.allowJson : false,
    xssiPrefix: options && options.xssiPrefix ? options.xssiPrefix : null
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
      var options_ = extend({}, self.req.app.locals, options);

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
        var options_ = extend({}, self.req.app.locals, options);
        delete options_.settings;

        data = [defaults_.xssiPrefix, JSON.stringify(options_)].join('');
      }

      self.send(data);
    };


    /**
     *  overwrite default render.
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

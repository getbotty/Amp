/**
 * Amp Framework - Core Module.
 * 
 * This module provides a container and core functionality for Amp.js
 * It is required for every other Amp module.
 *
 * Copyright Quipu GmbH (http://www.quipugmbh.com)
**/

(function(){
  /**
   * Amp factory.
   * Returns a new Amp object for a jQuery element.
   * It's also the Amp namespace exposed to window.
  **/
  var Amp = function(){
    var element, amp, type, options;

    if(arguments.length > 1){
      element = arguments[0];
      type    = arguments[1];
      options = arguments[2] || {};

      if(!(type in Amp.controls)) {
        throw new Error("Unrecognized control type: " + type);
      }

      element.data('amp', amp = Amp.controls[type](element, options));
    }
    return amp;
  }

  Amp.controls = {};
  Amp.keys = {
  	ALT:             18,
  	BACKSPACE:       8,
  	CAPS_LOCK:       20,
  	COMMA:           188,
  	COMMAND:         91,
  	WINDOWS:         91, // COMMAND
  	MENU:            93, // COMMAND_RIGHT
  	COMMAND_LEFT:    91, // COMMAND
  	COMMAND_RIGHT:   93,
  	CONTROL:         17,
  	DELETE:          46,
  	DOWN:            40,
  	END:             35,
  	ENTER:           13,
  	ESCAPE:          27,
  	HOME:            36,
  	INSERT:          45,
  	LEFT:            37,
  	NUMPAD_ADD:      107,
  	NUMPAD_DECIMAL:  110,
  	NUMPAD_DIVIDE:   111,
  	NUMPAD_ENTER:    108,
  	NUMPAD_MULTIPLY: 106,
  	NUMPAD_SUBTRACT: 109,
  	PAGE_DOWN:       34,
  	PAGE_UP:         33,
  	PERIOD:          190,
  	RIGHT:           39,
  	SHIFT:           16,
  	SPACE:           32,
  	TAB:             9,
  	UP:              38,
  };
  
  // JQuery's extends method copies prototype properties as well.
  // We need an extends method that will copy only own properties.
  Amp.extendObject = function(obj){
    _.each(Array.prototype.slice.call(arguments, 1), function(source) {
      var prop;
      for (prop in source) {
        source.hasOwnProperty(prop) && (obj[prop] = source[prop]);
      }
    });
    return obj;
  }

  // Instead Object.create() we use this
  if( ({}).__proto__ ) {
    Amp.createObject = function(proto, properties) {
      return Amp.extendObject({ __proto__: proto }, properties || {});
    }
  }
  else {
    Amp.createObject = function(proto, properties){
      function amp(){};
      amp.prototype = proto || {};
      return Amp.extendObject(new amp(), properties || {});
    }
  }
  
  /**
   * Makes AmpProxy conform with the Amp interface.
  **/
  Amp.registerMethods = function(methods){
    _.each(methods, function(name){
      Amp.AmpProxy.prototype[name] = function(){
        var args    = arguments;
        var results = this._amps.map(function(amp){ 
          if( amp instanceof $ ) {
            switch( name ){
              case 'disable': return amp.attr('disabled', 'disabled');
              case 'enable':  return amp.removeAttr('disabled');
              default:        return amp;
            }
          }
          return amp[name].apply(amp, args); 
        });
        // If all returned results are Amp controls, then return the proxy itself
        if( _.isArray(results) && _.all(results, function(result){ return result.__isAmpObject || result instanceof $; }) ) {
          return this;
        }
        return results;
      }   
    });
  }
  
  /**
   * Amp proxy for multiple Amp elements
  **/
  Amp.AmpProxy = function(amps){
    if( !_.isArray(amps) ) {
      amps = Array.prototype.slice.call(arguments);
    }

    // Fix missing `new` keyword
    if( this === Amp || this === window ) {
      return new Amp.AmpProxy(amps);
    }
    this._amps = amps;
  }
  
  Amp.AmpProxy.prototype.minus = function(amps){
    if(amps instanceof Amp.AmpProxy) {
      amps = amps._amps;
    }
    else if( !_.isArray(amps) ) {
      amps = Array.prototype.slice.call(arguments);
    }
    return new Amp.AmpProxy(_.difference(this._amps, amps));
  }
  
  Amp.AmpProxy.prototype.plus = function(amps){
    if(amps instanceof Amp.AmpProxy) {
      amps = amps._amps;
    }
    else if( !_.isArray(amps) ) {
      amps = Array.prototype.slice.call(arguments);
    }
    return new Amp.AmpProxy(_.union(this._amps, amps));
  }
  
  /**
   * This is the base control class. Everything inherits from it.
  **/
  var Control = function(element, options, subcontrol){
    var amp = Amp.createObject(Control.proto, { 
      element: element, 
      options: _.extend({ disabled: element.attr('disabled') }, options || {})
    });

    options.unstyled || element.addClass('amp');
    amp[amp.options.disabled ? 'disable' : 'enable'](true);

    if(!subcontrol && amp.options.linkTo){
      if(!(amp.options.linkTo instanceof $)) {
        amp.options.linkTo = $('#' + amp.options.linkTo);
      }
      if(amp.options.linkTo.length > 0){
        var isBool, isMulti = amp.options.linkTo.is('select[multiple]');
        if(isBool = _.include(['checkbox', 'radio'], (amp.options.linkTo.attr('type') || "").toLowerCase())) {
          amp.options.active = amp.options.linkTo.attr('checked');
        }
        else {
          amp.options.value = amp.options.linkTo.val();
        }
        amp.on("change", function(){
          var el = this.options.linkTo;
          isBool ? this.val() ? el.attr('checked', 'checked') : el.removeAttr('checked') : el.val( isMulti ? jQuery.parseJSON(this.toString()) : this.toString() );
        });
      }
    }
    return amp;
  }

  var evSplit = /\s+/, trim = /^\s+|\s+$/g;
  Control.proto = {
    __isAmpObject: true,

    val: function() {
      if(arguments.length === 0) {
        return this.__get();
      }
      this.__set.apply(this, arguments);
      return this;
    },

    on: function(name, callback, args) {
      var last, node, list, evs = this.__events || (this.__events = {}), events = name.replace(trim, '').split(evSplit);
      while(name = events.shift()){
        list      = evs[name];
        node      = list ? list.last : {};
        node.next = last = {};
        node.args = args;
        node.fn   = callback;
        evs[name] = {last: last, next: list ? list.next : node};
      }
      return this;
    },
    
    once: function(name, callback, args) {
      var self = this;
      function wrapper(){
        var ret = callback.apply(this, arguments);
        self.off(name, wrapper);
        return ret;
      }
      return this.on(name, wrapper, args);
    },

    off: function(name, callback) {
      var last, node, evs = this.__events, events = name.replace(trim, '').split(evSplit);
      while(evs && (name = events.shift())){
        node = evs[name];
        delete evs[name];
        if(!callback || !node){
          continue;
        }
        last = node.last;
        while((node = node.next) !== last){
          node.fn === callback || this.on(name, node.fn, node.args);
        }
      }
      return this;
    },
    
    trigger: function(name) {      
      var result, last, node, evs = this.__events, events = name.replace(trim, '').split(evSplit), args = Array.prototype.slice.call(arguments, 1);
      while(evs && (name = events.shift())) {
        if(node = evs[name]) {
          last = node.last;
          while((node = node.next) !== last) {
            if((result = node.fn.apply(this, (node.args || []).concat(args))) !== undefined && !result){
              return false;
            }
          }
        }
      }
      return true;
    },

    enable: function(silent){
      this.options.disabled = false;
      this.element.removeAttr('disabled');
      silent || this.trigger('enable');
      return this;
    },

    disable: function(silent){
      this.options.disabled = true;
      this.element.attr('disabled', 'true');
      silent || this.trigger('disable');
      return this;
    }
  }

  Control.proto.bind   = Control.proto.on;
  Control.proto.unbind = Control.proto.off;

  Amp.controls.control = Control;
  Amp.registerMethods(_.keys(Control.proto));

  // Amp jQuery binding
  $.fn.amp = function(){
    var ret, type = arguments[0], options = arguments[1] || {}, args = arguments;

    // Amp getter
    if(arguments.length === 0) {
      switch(this.length){
        case 0:  throw "Can't get the Amp object from an empty jQuery selection.";
        case 1:  
          if(ret = this.data('amp')) {
            return ret;
          }
          throw "This element does not have an associated Amp object."
        default: return new Amp.AmpProxy(_.map(this, function(el){ return $(el).amp(); }));
      }
    }

    // Amp setter
    switch(this.length){
      case 0:  throw "Can't make an Amp object out od an empty jQuery selection.";
      case 1:  return Amp(this, type, options);
      default: return new Amp.AmpProxy(_.map(this, function(el){ return Amp($(el), args[0], args[1]); }));
    }   
  }

  // Alias AmpProxy
  Amp.Group = Amp.AmpProxy;

  // Expose Amp
  window.Amp = Amp;
})();

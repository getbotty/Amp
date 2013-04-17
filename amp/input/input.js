/* ====================================
 * Amp framework v1.0.0
 * Quipu GmbH (http://www.quipugmbh.com)
 *
 * Amp Input.
 * ==================================== */
;(function($, Amp) {

  function Input(element, options){
    return Amp.createObject(Input.proto, Amp.controls.control(element, options));
  }

  Input.proto = Amp.createObject(Amp.controls.control.proto, {
    __reformat: function(val){
      val === undefined && (val = this.element.val());
      this.element.val(val);
      this.element.data('valBeforeType', val);
      return this;
    },

    toString: function(){
      var val = this.__get();
      return val === null ? "" : val;
    }
  });

  function TextInput(element, options){
    var format, value, input, options = options || {};
    
    value  = options.value  || null
    format = options.format || null;

    delete options.value;
    delete options.format;

    input = Amp.createObject(TextInput.proto, Input(element, options));
    input.element.addClass('amp-text');
    input.__set(value, true);
    input.setFormat(format);

    return input;
  }
  
  TextInput.proto = Amp.createObject(Input.proto, {    
    __get: function() {
      return this.element.val();
    },
    
    __set: function(value, silent, oldval){
      oldval === undefined && (oldval = this.__get());
      value = value === null ? "" : "" + value;
      
      if(value && this.options.format && !this.options.format.test(value)){
        this.element.val(oldval === null ? "" : oldval);
        return this;
      }

      if(oldval !== value) {
        if(this.trigger('beforechange', oldval, value) !== false) {
          this.element.val(value);
          silent || this.trigger('change');
        }
        else {
          this.element.val(oldval);
        }
      }
      
      this.element.data('valBeforeEdit', this.__get());
      this.element.data('valBeforeType', this.element.val());
      return this;
    },
    
    // Prevents changing the value of an input if it doesn't check out 
    // with the regular expression passed as format
    setFormat: function(format){
      if("" + this.options.format === "" + format) {
        return this;
      }

      if(!format) {
        this.options.format = null;
      }
      else if(format instanceof RegExp) {
        this.options.format = format;
      }
      else {
        try {
          this.options.format = new RegExp(format);
        } catch (e) {
          throw "Invalid formatting for input '" + this.element.attr('id') + "': " + format;
        }
      }
      return this;
    }
  });

  
  function NumberInput(element, options){
    var min, max, format, value, input, options = options || {};
    
    value  = options.value;
    format = options.format;
    min    = options.min;
    max    = options.max;
    
    delete options.min;
    delete options.max;
    delete options.format;
    delete options.value;

    input = Amp.createObject(NumberInput.proto, Input(element, options));
    input.element.addClass('amp-number');
    input.setFormat(format);

    input.__set(value, true);
    input.clamp(min, max);

    return input;
  }

  NumberInput.proto = Amp.createObject(Input.proto, {
    __get: function() {
      var val = parseFloat(this.element.val().replace(/,/g, ''), 10);
      return isNaN(val) ? null : val;
    },

    __set: function(value, silent, oldval) {
      oldval === undefined && (oldval = this.__get());
      value = parseFloat(('' + value).replace(/,/g, ''), 10);

      isNaN(value) && (value = null);

      if( value !== null ) {
        var min = this.options.min;
        var max = this.options.max;

        if((min !== undefined && min !== null && value < min) || (max !== undefined && max !== null && value > max)){
          this.element.val(oldval === null ? "" : oldval.format(this.options.format));
          return this;
        }
      }
      
      if(oldval !== value) {
        this.element.val(value === null ? "" : value.format(this.options.format));
        silent || this.trigger('change');
      }
      
      this.element.data('valBeforeEdit', this.__get());
      this.element.data('valBeforeType', this.element.val());
      return this;
    },

    toString: function() {
      var val = this.__get();
      return val === null ? "" : "" + val;
    },

    setFormat: function(format){
      var precision = format = isNaN(format) ? 0 : parseInt(format, 10);

      if(this.options.format === format) {
        return this;
      }
      this.options.format = format;
      
      var options           = this.options;
      var maxlength         = options.maxlength || null;
      var dot               = precision > 0 ? '.' : '';
      var allowedKeys       = [37, 38, 39, 40, 27, 8, 46, 9];
      var regexLeadingZeros = /^0[^.]/;
      var regexValidChar    = new RegExp('[0-9' + dot + ']');

      // Unbind the previously bound formatting handler (if any)
      this.__formatter && this.element.off('keydown', this.__formatter);

      // Performs as-you-type formatting of numerical inputs by inserting commas 
      // after every third digit and disallowing input of leading zeros and non-digit 
      // characters except for dots in decimal fields.
      this.element.on('keydown', this.__formatter = function(e){
        // This beforechange event was not invoked by typing
        if(!e || typeof e !== 'object' || !e.which) {
          return;
        }
        // This will allow arrow keys, cut, copy, paste actions.
        // It will also allow any input for browsers < IE8 that don't support the selection api.
        if(_.include(allowedKeys, e.which) || !('selectionStart' in this && 'selectionEnd' in this) || e.metaKey) {
          return;
        }
        // 96-105 are numpad numbers
        if(e.which >= 96 && e.which <= 105) {
          e.which -= 48;
        }
        // 110 is the numpad decimal point
        if(e.which === Amp.keys.NUMPAD_DECIMAL) {
          e.which = Amp.keys.PERIOD
        }

        var ch = e.which === Amp.keys.PERIOD ? '.' : String.fromCharCode(e.which);
        if(regexValidChar.test(ch)){
          var i, tmpStart, parts, whole, decimal, highOrder,
              newValue    = "",
              caretOffset = 1,
              start       = this.selectionStart,
              newStart    = this.selectionStart,
              end         = this.selectionEnd,
              value       = this.value,
              value       = value.substr( 0, start ) + value.substr( end );

          // Disallow more than one dot   
          if(ch === dot && value.indexOf(ch) !== -1){
            e.preventDefault()
            return false;
          }

          // Auto-prepend zeros when the user hits '.' on an empty field
          if(ch === dot && value.length === 0){
            ch = '0.';
            caretOffset += 1;
          }

          // Compensate caret position for removed commas
          tmpStart = start;
          for(i=0; i < start; i++){
            if( value[i] == "," ){
              tmpStart -= 1;
            }
            start = tmpStart;
          }

          // Disallow leading zeros for the whole number part.
          if( ch === '0' ){
            var testval = value.replace(/,/g, '');
            testval = testval.substr( 0, start ) + ch + testval.substr( start );
            if( regexLeadingZeros.test( testval ) ){
              e.preventDefault()
              return false;
            }
          }

          // Change the value of the field (add commas)
          value     = value.replace(/,/g, '');
          value     = value.substr(0, start) + ch + value.substr(start);
          parts     = value.split(".");
          whole     = parts[0];
          if(precision > 0 && parts[1] && parts[1].length > precision){
            e.preventDefault();
            return;
          }
          decimal   = parts[1] === undefined ? "" : "." + parts[1];
          highOrder = whole.length % 3;
          for(i=0; i<whole.length; ++i){
            if( i && ((i - highOrder) % 3 == 0) ){
              newValue += ",";
              if( i < start + 1 )
                caretOffset += 1;
            }
            newValue += whole[i];
          }

          newValue += decimal;
          newNumVal = parseFloat(newValue.replace(/,/g, ''), 10);
        
          // We need to programatically limit the length since the input is value changes programatically
          if( (maxlength && newValue.length > maxlength) ) {
            return false;
          }
        
          this.value = newValue;
          this.selectionStart = this.selectionEnd = start + caretOffset;
        }

        e && e.preventDefault && e.preventDefault();
        return false;
      });

      return this;
    },

    clamp: function(min, max){
      this.options.min = isNaN('' + min) ? null : min;
      this.options.max = isNaN('' + max) ? null: max;
      return this;
    }
  });

  $(function() {
    $(document.body)
    .delegate('input.amp:not([disabled])', {    
      keyup: function (e) {
        var self = $(this), value = self.val();
        if(self.data('valBeforeType') + "" !== value + "") {
          self.amp().trigger('type', value, e);
        }
        $(this).data('valBeforeType', this.value);
      },

      focus: function (e) {
        $(this).data('valBeforeEdit', $(this).amp().val());
        $(this).data('valBeforeType', $(this).val());
      }
    })

    .delegate('input.amp:not(.amp-date):not([disabled]):not(.amp-combo)', 'blur', function (e) {
      var self = $(this), amp = self.amp();
      amp.__set(amp.val(), false, self.data('valBeforeEdit'));
    });
  });

  Amp.controls.input  = Input;
  Amp.controls.text   = TextInput;
  Amp.controls.number = NumberInput;
  Amp.registerMethods(['__reformat', 'setFormat', 'clamp']);
})(window.jQuery, window.Amp);

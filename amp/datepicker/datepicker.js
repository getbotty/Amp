/** Amp Datepicker Code **/
;(function($, Amp) {
  
  // The years and months select
  var years, months;
  
  // The datepicker div;
  var datepicker = $("\
<div class='amp-dpdiv'>\
  <div class='amp-dpdiv-border-cover'></div>\
  <div class='amp-dpheader'>\
    <button id='amp-dp-month-select' tabindex='-1'>&nbsp;</button>&nbsp;\
    <button id='amp-dp-year-select' tabindex='-1'>&nbsp;</button>\
  </div>\
  <div class='amp-dpbody'></div>\
</div>");
  var cover = $('.amp-dpdiv-border-cover', datepicker);
      
  function Datepicker(element, options){
    var defaults = {
      max:       null, // Maximum date value
      min:       null, // Minimum date value
      validator: null, // Function(s) that get called before rendering each day and after setting a value.
      range:     "6",  // Year range to show ( "5" shows 5 years before and after, "+5" shows 5 years after, "-5" shows five years before )
      language:  {},   // Take a look at the prototype days/months arrays
    };
    var format, value, input, options = _.extend(defaults, options || {});
    
    value  = options.value || null;
    format = options.format || "yy-mm-dd";
    
    delete options.format;
    delete options.value;
    
    input = Amp.createObject(Datepicker.proto, Amp.controls.input(element, options));
    input.element.addClass('amp-date').attr('autocomplete', 'off');
    input.setFormat(format);

    input.__set(value, true);
    input.clamp(options.min, options.max);
    input.on('type', function(){
      var date = input.__getRepr(this.element.val());
      if(date) {
        input.__divRender(date);
        input.__updateLists(date);
      }
    });

    return input;
  }
  
  Datepicker.proto = Amp.createObject(Amp.controls.input.proto, {
    /**
     * The following methods and properties deal with the rendering
     * of the datepicker calendar widget.
    **/
    daysL:   [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ],
    daysI:   [ 'M', 'T', 'W', 'T', 'F', 'S', 'S' ],
    daysS:   [ 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su' ],
    monthsL: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
    montshS: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
    
    __getValidators: function(){
      var validator, min, max, self = this;

      if(validator = this.options.validator) {
        if(_.isObject(validator)){
          validator = _.values(validator);
        }
        else if(_.isArray(validator)){
          validator = validator.slice();
        }
        else {
          validator = [validator];
        }
        if(_.any(validator, function(v){ return !_.isFunction(v); })){
          throw "Invalid validators passed for " + this.element.attr('id') + ". Must be a function or an array/object of functions.";
        }
      }
      
      if(min = this.options.min) {
        validator.push(function(date){
          return +date >= min;
        });
      }
      if(max = this.options.max){
        validator.push(function(date){
          return +date >= min;
        });
      }
      
      return validator;
    },
    
    __cellRender: function(date, val, day){
      var disabled, active = val && date.getFullYear() === val.getFullYear() && date.getMonth() === val.getMonth() && val.getDate() === day;
      
      if(day > 0 && (validator = this.__getValidators())) {
        disabled = !_.all(validator, function(v){
          return v.call(self, new Date(date.getFullYear(), date.getMonth(), day));
        });
      }
      
      return "<td class='" + (active ? "active" : "") + (disabled ? " disabled" : "") + (day > 0 ? '' : 'empty') + "'>" + (day > 0 ? day : '') + "</td>";
    },

    __divRender: function(d){
      var html, i, extra, val = this.val();
      var date = d || val || new Date();
      var dim  = date.getDaysInMonth();

      i = 2 - ((new Date(date.getFullYear(), date.getMonth(), 1)).getDay() || 7);
            
      extra = Array(7 - ((dim - i)  % 7)).join("<td class='empty'></td>")
      html = "<table cellspacing='0' cellpadding='0' border='0' class='amp-dptable'><tr><th>" + this.daysI.join("</th><th>") + "</th></tr><tr>";
      for(o = 1; i <= dim; ++i, ++o) {
        html += this.__cellRender(date, val, i);
        o % 7 === 0 && (html += "</tr>" + i === dim ? "" : "<tr>");
      }
      html += extra + "</table>";

      $('.amp-dpbody', datepicker).html(html);
      
      this.position();
    },
    
    __updateLists: function(d){
      var self  = this;
      var date  = d || this.val() || new Date();
      var year  = date.getFullYear();
      var month = date.getMonth();
      var rnum  = parseInt(this.options.range, 10);
      var range = this.options.range[0] === "+" ? [year, year + rnum] : this.options.range[0] === "-" ? [year + rnum, 0] : [year - rnum, year + rnum];
      var i, yearItems = [];
      
      for(i=range[0]; i<=range[1]; ++i) {
        yearItems.push({ value: "" + i, label: i });
      }
      
      years.reset(yearItems, true, true).val("" + year, true);
      months.reset(_.map(this.montshS, function(month, m){ return { value: "" + m, label: month } }), true, true).val("" + month, true);
    },

    /**
     * Returns a Date repesentation of the passed value.
     * If the value can't be represented as a Date object, returns null.
    **/
    __getRepr: function(value) {
      if( value instanceof Date ) {
        return value;
      }
      else if( typeof value === 'number' ) {
        return new Date(value);
      }
      try { 
        return Date.parseDate(this.options.format, value); 
      }
      catch(e) { 
        return null; 
      }
    },
    
    __get: function(){
      return this.__getRepr(this.element.val());
    },

    __set: function(value, silent, oldval){
      var validators;
      oldval === undefined && (oldval = this.__get());

      try {
        value = (value instanceof Date) ? value : Date.parseDate(isNaN(value) ? this.options.format : '@', value);
      }
      catch(e) { 
        value = null; 
      }

      if( value !== null ) {
        validators = this.__getValidators();
        // If the validators don't pass, revert to old value.
        if(!_.all(validators, function(v){ return v.call(self, value.clone()); })) {          
          this.element.val(oldval === null ? "" : Date.formatDate(this.options.format, oldval));
          return this;
        }
        
        var min = this.options.min;
        var max = this.options.max;
        
        if( min !== undefined && min !== null && +value < +min ) value = +min;
        if( max !== undefined && max !== null && +value > +max ) value = +max;

        value = new Date(value);
      }
      if(value === null && oldval === value) {
        this.element.val("");
      }
      else if('' + oldval !== '' + value) {
        this.element.val(value === null ? "" : Date.formatDate(this.options.format, value));
        silent || this.trigger('change');
      }
      
      this.element.data('valBeforeEdit', this.__get());
      this.element.data('valBeforeType', this.element.val());
      return this;
    },
    
    show: function() {
      if(this.__shown) {
        return;
      }

      this.__shown = true;
      this.__updateLists();
      this.__divRender();
      this.element.addClass('active');
      this.position();
      
      datepicker.curinst = this;
      datepicker.addClass('shown');
      
      return this;
    },
    
    position : function(){
      var w, w2, h2, o, p, h, dfb;

      p  = this.element.position();
      o  = this.element.offset();
      w  = this.element.outerWidth(true);
      h  = this.element.outerHeight();
      w2 = datepicker.outerWidth(true);
      h2 = datepicker.outerHeight(true);
      
      if((dfb = $(window).height() - (h - $(window.document).scrollTop() + o.top)) - 20 < h2) {
        datepicker.css({ top: p.top - datepicker.outerHeight(true), left: p.left + w/2 - w2/2 }).removeClass('below').addClass('above');
        datepicker.detach().insertBefore(this.element);
      }
      else {
        datepicker.css({ top: p.top + this.element.outerHeight(true), left: p.left + w/2 - w2/2 }).removeClass('above').addClass('below');
        datepicker.detach().insertAfter(this.element);
      }

      w =  w - 2;
      w2 = w2 - parseInt(datepicker.css('borderLeftWidth'), 10) - parseInt(datepicker.css('borderRightWidth'), 10);
      cover.css({ width: Math.min(w, w2), left: Math.max(0, w2/2 - w/2 ) });
      
      return this;
    },

    hide: function() {
      this.__shown = false;
      this.element.removeClass('active');
      datepicker.curinst = null;
      datepicker.removeClass('shown');
    },

    toString: function(){
      var val = this.__get();
      return val ? Date.formatDate(this.options.format, val) : "";
    },

    setFormat: function(format){
      if(this.options.format === format){
        return this;
      }
      var self = this;

      this.options.format = format;
      return this;
    },
    
    clamp: function(min, max){
      this.options.min = this.__getRepr(min);
      this.options.max = this.__getRepr(max);
      return this;
    }
  });
  
  $(function () {
    $('body')
    // Close the datepicker by clicking anywhere else on the screen
    .on('mousedown', function(e){
      var t = e.target;
      if( datepicker.curinst && 
          !datepicker.curinst.element.is(t) &&
          !datepicker.find(t).length && 
          !datepicker.is(t) &&
          !years.list.element.find(t).length &&
          !years.list.element.is(t) &&
          !months.list.element.find(t).length &&
          !months.list.element.is(t) ) {
        datepicker.curinst.__innerClick = false;
        datepicker.curinst.hide();
      }
      else {
        datepicker.curinst && (datepicker.curinst.__innerClick = true);
        setTimeout(function(){
          if(datepicker.curinst) {
            datepicker.curinst.__innerClick = years.element.is(t) || years.element.find(t).length || months.element.is(t) || months.element.find(t).length;
            datepicker.curinst && datepicker.curinst.element.focus();
          }
        }, 0);
      }
    })

    // The datepicker needs to be shown when the field is clicked, even when focused
    .delegate('input.amp.amp-date:not([disabled])', {
      click: function(e){
        $(this).amp().show();
      },
      focus: function(e) {
        $(this).amp().show();
      },
      blur: function(e){
        var self = $(this), amp = self.amp();
        if(amp.__innerClick) {
          return;
        }
        amp.__set(amp.val(), false, self.data('valBeforeEdit'));
        amp.hide();
      },
      keydown: function(e){
        if(e.which === Amp.keys.TAB) {
          this.__canBlur = true;
        }
      }
    });
    
    years = $('#amp-dp-year-select', datepicker).amp('select', { items: [] });
    months = $('#amp-dp-month-select', datepicker).amp('select', { items: [] });
    Amp.Group(years, months).on('change', function (){
      var y = parseInt(years.val(), 10);
      var m = parseInt(months.val(), 10);
      isNaN(y) || isNaN(m) || datepicker.curinst && datepicker.curinst.__divRender(new Date(y, m, 1));
    });
    years.on('change', function(){
      if(!datepicker.curinst) {
        return;
      }

      var date = (datepicker.curinst.val() || new Date()).clone();
      date.setYear(parseInt(years.val(), 10));
      date.setMonth(parseInt(months.val(), 10));
      datepicker.curinst.__updateLists(date);
    });

    datepicker.delegate('td:not(.disabled):not(.empty)', 'click', function(){
      var self = $(this), 
          year  = parseInt(years.val(), 10), 
          month = parseInt(months.val(), 10) 
          day   = parseInt(self.html(), 10);

      datepicker.curinst.__set(new Date(year, month, day), false);
      datepicker.curinst.hide();
    });
  });
  
  
  Amp.controls.date = Datepicker;
  Amp.registerMethods(['show', 'hide']);
})( window.jQuery, window.Amp );
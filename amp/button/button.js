/** 
 * Amp Buttons
**/
;(function($, Amp) {

  function Button(element, options){
    var button = Amp.createObject(Button.proto, Amp.controls.control(element.addClass('btn'), options || {}));

    if(button.options.active){
      button.element.addClass('active');
      button.options.active = true;
    }
    else {
      button.element.removeClass('active');
      button.options.active = false;
    }
    return button;
  }

  Button.proto = Amp.createObject(Amp.controls.control.proto, {
    __get: function() { 
      return !!this.options.active; 
    },

    __set: function(value, silent) {
      if(value) {
        // This code is only for radio buttons
        this.options.group && this.options.group.map(function(i, btn){ 
          (btn = $(btn).amp()) && btn.val(false); 
        });
        this.element.addClass('active');
        this.element.is('input[type=checkbox],input[type=radio]') && this.element.attr('checked', 'checked');
        this.options.active = true;
      }
      else {
        this.element.removeClass('active');
        this.element.is('input[type=checkbox],input[type=radio]') && this.element.removeAttr('checked');
        this.options.active = false;
      }
      silent || this.trigger('change');
    },

    toString: function() {
      return this.__get() ? "1" : "";
    }
  });

  function Checkbox(element, options){
    element.attr('checkbox', 'true').is('input[type=checkbox]') && (options.active = !!element.attr('checked'));
    return Amp.createObject(Button.proto, Amp.controls.button(element, options || {}));
  }

  function Radio(element, options){
    element.attr('radio', 'true').is('input[type=radio]') && (options.active = !!element.attr('checked'));

    options.name  = element.attr('name');
    options.group = $('button[name=' + options.name + '], input[type=radio][name=' + options.name + ']').not(element);

    if(!options.name || options.group.length === 0) {
      throw "Trying to create a radio button without a `name` attribute or radio group.";
    }
    return Amp.createObject(Button.proto, Amp.controls.button(element, options || {}));
  }
  
  $(function () {
    // This is a hack that enables us to set the active state on buttons
    // that are already focused in browsers that missbehave (like webkit)
    var pressed;
    
    $(document.body)
    .mouseup(function(){ 
      pressed = null; 
    })
    .delegate('button.amp.btn:not([disabled])', 'click', function (e) {
      $(this).focus().amp().trigger("click");
    })
    .delegate('button.amp.btn:not([disabled])', 'click', function(e){
      $(this).attr('type') === 'submit' || e.preventDefault();
    })
    .delegate('button.amp.btn:not([disabled]):not([radio]):not([checkbox])', {
      mousedown: function (e) {
        (pressed = this) && $(this).addClass('active');
      },
      mouseover: function (e) {
        (pressed === this) && $(this).addClass('active');
      },
      mouseup: function (e) {
        $(this).removeClass('active');
      },
      mouseout: function (e) {
        $(this).removeClass('active');
      }
    })
    .delegate('button.amp.btn[checkbox]:not([disabled])', 'click', function(e){
      $(this).amp().val(!$(this).amp().val());
    })
    .delegate('button.amp.btn[radio]:not([disabled])', 'click', function(e){
      $(this).amp().val(true);
    });
  });

  Amp.controls.button   = Button;
  Amp.controls.checkbox = Checkbox;
  Amp.controls.radio    = Radio;
})( window.jQuery, window.Amp );

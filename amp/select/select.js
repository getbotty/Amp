/**
 * Amp Select, Combo and Tag lists
 *
**/

;(function($, Amp) {
  var slice = Array.prototype.slice;
  
  function Select(element, options){
    var value, button, list;
        
    button = Amp.createObject(Select.proto, Amp.controls.button(element, _.extend({ items: [] }, options || {})));
    button.__rendered = false;

    button.options.placeholder = options.placeholder || element.html();
    button.element.addClass('amp-select');
    button.element.html("<div class='l'>" + button.options.placeholder + "</div><div class='i'></div>");
    
    list = $('<div id="' + _.uniqueId('amp-') + '-list" class="amp-list amp-panel"></div>').appendTo($(document.body));
    button.list = list.amp('list', _.extend({}, options, { standalone: false, multiple: false }));
    button.list.parent = button;

    button.list.on('itemclick', function(){
      button.hide();
    }).on('change', function(){
      return button.trigger('change', slice.call(arguments));
    }).on('__change', function(){
      $(element[0].childNodes[0]).html(this.selected.length ? this.items[this.selected[0]].label : button.options.placeholder);
    }).on('reset', function(){
      button.trigger('reset');
    }).trigger('__change');
    
    // TODO: Why is this here? Why do we need to disable the list when it's invisible and can't be shown ?
    button.on('disable', function(){
      button.list.disable();
    }).on('enable', function(){
      button.list.enable();
    });

    return button;
  }

  Select.proto = Amp.createObject(Amp.controls.control.proto, {
    /* Private getter
     * This is a simple wrapper around the list's getter that will return a single value instead of a list.
     * @return Mixed the selected item's value.
     */
    __get: function() {
      var get = this.list.__get();
      return get.length ? this.list.items[get[0]].value : null;
    },
    
    /* Private setter
     * This is a simple wrapper around the list's setter that will disallow multiple selections.
     * @return this
     */
    __set: function(value, silent) {
      this.list.__set(value, silent);
      return this;
    },
    
    /**
     * Returns the selected list item
    **/
    item: function(){
      return this.list.selected.length ? this.list.items[this.list.selected[0]] : null;
    },
    
    toString: function(){ 
      return this.__get() || "";
    },
    
    reset: function(items, silent, silenceChange) {
      this.__rendered = false;
      this.list.reset(items, silent, silenceChange);      
      return this;
    },

    keydown: function(e){
      if(this.list.element.hasClass('shown')) {
        if(e.which === Amp.keys.ESCAPE) {
          this.hide();
          return false;
        }
        return this.list.keydown(e);
      }
      else if(e.which === Amp.keys.ENTER || e.which === Amp.keys.SPACE){
        this.show();
        return false;
      }
    },
    
    /**
     * Noop for ducktyping
    **/
    keypress: function(e){},
    
    /**
    * Opens the list and centers it over the Select button.
    * The list behaves mostly like in Mac OS X - it does not drop
    * below the select control (button), but rather takes up all 
    * the available vertical space in the window.
    * 
    * @return this
    */
    show: function() {
      if(this.list.element.hasClass('shown')) {
        return this;
      }
      
      var offset  = this.element.offset();
      var top     = offset.top;
      var left    = offset.left;
      var width   = this.element.outerWidth(true);
      var height  = this.element.height();
      var st      = $(window).scrollTop();  // window scroll from top
      var ww      = $(window).width();      // window width
      var wh      = $(window).height();     // window height
      var rtop, rhei;
      
      // Don't show the list if no items were rendered
      if(this.__rendered || !this.list.render()) {
        return this;
      }
      
      var panel = this.list.element;
      var list  = $(panel[0].childNodes[0]);
      var rwid  = Math.min(Math.max(width+8, list.width()), ww - left - 8);
      var lhei  = list.height();
      var dfb   = wh - top + st;  // Distance of button top edge from the window bottom edge  
      
      panel.css({ left: left, top: top, width: 10, height: 10 });

      if(lhei < (dfb-8)) { // List fits below button, render it from the top button edge
        rtop = top;
        rhei = lhei;
      }
      else if(lhei < (wh-16)) { // List fits window, render it so that it touches bottom window edge
        rtop = top - (lhei - dfb) - 8;
        rhei = lhei;
      }
      else { // List doesn't fit window, render it from top to bottom edge of window
        rtop = st + 8;
        rhei = wh - 16;
      }
      panel.css({ left: left, top: rtop, width: rwid, height: rhei}).addClass('shown');
      this.list.selected.length && this.list.scrollToItem(this.list.selected[0]);
      return this;
    },
    
    /**
     * Closes the list
     * 
     * @return this
    **/
    hide: function() {
      this.list.focusElement(null);
      this.list.element.removeClass('shown');
      return this;
    }
  });
  
  function Combo(element, options){
    var input, list, value;

    options = _.extend({ 
      minchars: 2, 
      items:    []
    }, options || {});
    
    value = options.value || null;
    delete options.value;

    input = Amp.createObject(Combo.proto, Amp.controls.text(element, options));
    input.__rendered = false;
    input.element.addClass('amp-combo');

    function filter(item){
      var result = (!input.options.filter || input.options.filter.call(input, item));
      if( result === -1 ) {
        return true;
      }
      return result && ~item.label.toLowerCase().indexOf(element[0].value.toLowerCase());
    }
    
    list = $('<div id="' + _.uniqueId('amp-') + '-list"></div>').appendTo(document.body);
    list.addClass("amp-list amp-panel").css("min-width", element.outerWidth(true));

    input.list = list.amp('list', _.extend({}, options, { standalone: false, multiple: false, filter: filter, value: value }));
    input.list.parent = input;

    input.on('type', function(value){
      this.hide();
      if(value.length < (options.minchars || 2)) {
        return;
      }
      if(options.ajax) {
        this.list.once('ajaxend', function(){ input.show(); });
        this.list.reset(this.getAjaxURL(value), false, true);
      }
      else {
        this.show();
      }
    })
    
    // TODO: Why is this here? Why do we need to disable the list when it's invisible and can't be shown ?
    .on('disable', function(){
      input.list.disable();
    }).on('enable', function(){
      input.list.enable();
    });

    input.list.on('itemclick', function(){
      input.hide();
    }).on('change', function(){
      input.__reformat();
      return input.trigger('change', slice.call(arguments));
    }).on('reset', function(){
      input.trigger('reset');
    }).on('ajax', function(){
      input.element.addClass('amp-loading');
    }).on('ajaxend', function(){
      input.element.removeClass('amp-loading');
    });

    input.__reformat();
    return input;
  }

  Combo.proto = Amp.createObject(Select.proto, {    
    /** 
     * Private setter
     * This is a simple wrapper around the list's setter that will disallow multiple selections.
     * @return this
    **/
    __set: function(value, silent) {
      var self = this;
      var norm = this.list.__normalizeSelection(value);

      // Nothing's changing
      if(this.list.selected.length === norm.length && _.difference(this.list.selected, norm) === 0) {
        return this;
      }
      // We don't have this value in our current set of items, and we use ajax
      if(this.options.ajax && value && norm.length === 0) {
        this.list.once('ajaxend', function(){
          this.__set(value, silent);
          self.__reformat();
        });
        this.list.reset(this.getAjaxURL(), false, true);
      }
      // We don't use ajax or we already do have this value in our current set of items
      else {
        this.list.__set(value, silent);
        this.__reformat();
      }
      return this;
    },
        
    __reformat: function(value){
      // Get the index of the selected item and set it's label as the value of the input field
      value = this.list.items[ this.list.selected[0] ];
      Amp.controls.input.proto.__reformat.call(this, value ? value.label : "");
    },
    
    /**
     * Returns the ajax URL to be called for a specific query
     * @return this
    **/
     getAjaxURL: function(q){
       var ajax = this.options.ajax;
       var data = typeof ajax.data === 'function' ? ajax.data.call(this) : (ajax.data || {});
       return ajax.url + '?' + $.param(_.extend(data, {q: q}));
     },
    
    /**
    * Opens the list and shows it below or above the input field.
    * If there's enough space below to show the complete list or 
    * there are at least 150px of vertical space the list will be shown below, otherwise above.
    * 
    * @return this
    */
    show: function() {
      var offset  = this.element.offset();
      var top     = offset.top;
      var left    = offset.left;
      var width   = this.element.outerWidth(true);
      var height  = this.element.outerHeight(true);
      var st      = $(window).scrollTop();      // window scroll from top
      var wh      = $(window).height();         // window height
      
      // Don't show the list if no items were rendered
      if(this.__rendered || !this.list.render()) {
        return this;
      }
      this.__rendered = true;
      
      var panel = this.list.element;
      var list  = $(panel[0].childNodes[0]);
            
      var dfb   = st + wh - top;  // Distance of button top edge from the window bottom edge 
      var lhei  = list.outerHeight(true);
      var rtop, rhei;

      if(lhei < dfb - 10) { // List fits below text field, render it there.
        rtop = top + height + 2;
        rhei = lhei;
      }
      else if( dfb - 8 > 150 ){ // There's a reasonable amount of space below text field, render it there.
        rtop = top + height + 2;
        rhei = dfb - height - 10;
      }
      else {  // There's too little space below text field, render it above
        rhei = Math.min(wh - dfb - 10, lhei); 
        rtop = Math.max(st + 5,  st + (wh - dfb - lhei) - 5);
      }
      
      panel.css({left: left, top: rtop, width: Math.min(list.width(), $(window).width() - left - 8), height: rhei}).addClass('shown');
      this.list.selected.length && this.list.scrollToItem(this.list.selected[0]);
      return this;
    },
    
    /**
     * Closes the list
     * 
     * @return this
    **/
    hide: function() {
      this.__rendered = false;
      this.list.focusElement(null);
      this.list.element.css("width", "").removeClass('shown');
      return this;
    },
    
    /**
     * Resets the items in the list
    **/
    reset: function(items, silent, silenceChange) {
      this.__rendered = false;
      this.list.reset(items, silent, silenceChange);
      return this;
    },

    keydown: function(e){
      var self = this;

      if(this.list.element.hasClass('shown')) {
        if(e.which === Amp.keys.ESCAPE) {
          this.hide();
          return false;
        }
        return this.list.keydown(e);
      }
      else if(e.which === Amp.keys.UP || e.which === Amp.keys.DOWN) {
        if(this.options.ajax) {
          this.list.once('ajaxend', function(){ self.show(); });
          this.list.reset(this.getAjaxURL(this.element.val(), false, true));
        }
        else {
          this.show();
        }
      }
    }
  });
  
  function Tags(element, options){
    var list, input, value, selected = [];

    options = _.extend({ 
      multiple:    true, 
      nullable:    true,
      minchars:    2,
      items:       [], 
      placeholder: "Please Select",
      picker:      "select"
    }, options || {});

    value = 'value' in options ? options.value : null;
    delete options.value;

    // This is the carrier object.
    list = Amp.createObject(Tags.proto, Amp.controls.control(element, options));
    list.element.addClass('amp-tags').empty();
    
    if( options.picker === 'select' ) {
      input = $("<button id='" + _.uniqueId('amp-') + "'>" + options.placeholder + "</button>").appendTo(list.element);
      list.input = input.amp('select', { items: options.items, placeholder: options.placeholder });
      list.input.list.options.filter = function(item){
        return selected.indexOf(item.value) === -1;
      }
    }
    else if( options.picker === 'combo' ) {
      input = $("<input id='" + _.uniqueId('amp-') + "' placeholder='" + options.placeholder + "'>").appendTo(list.element);
      list.input = input.amp('combo', { items: options.items });
      list.input.options.filter = function(item){
        return selected.indexOf(item.value) === -1;
      }
    }
    else {
      throw "A Tag List requires the 'picker' option to be specified. Choose 'combo' or 'select'";
    }

    list.rendered = false;
    list.selected = [];
    list.reset(options.items, true);
    list.selected = list.__normalizeSelection(value || []);
    
    // We filter out the selected items from the input's list.
    // We do this by keeping track of our main list's selected values.
    selected = list.toJSON();
    
    list.input.on('change', function(val){
      if( val = list.input.val() ) {
        list.__set(val, false, true);
        list.input.val(null, true);
      }
    });
    
    list.on('change', function(){
      list.renderTags();
      selected = list.toJSON();
    }).on('disable', function(){
      list.input.disable(true);
      list.element.find('.amp-tag').attr('tabindex', '-1');
    }).on('enable', function(){
      list.input.enable(true);
      list.element.find('.amp-tag').attr('tabindex', '0');
    })
    
    return list.render();
  }
  
  Tags.proto = Amp.createObject(Amp.controls.list.proto, {
    renderTags: function(){
      var self = this;
      var tagElements = this.element.find('.amp-tag');
      var rendered = tagElements.map(function(index, el){ 
        return parseInt($(el).data('index'), 10); 
      }).toArray();

      var toRemove = _.difference(rendered, this.selected);
      var toInsert = _.difference(this.selected, rendered);

      _.each(toRemove, function(index){ 
        tagElements.filter('[data-index=' + index + ']').remove(); 
      });

      this.element.append(toInsert.map(function(index){
        return "<span class='amp-tag' data-index='" + index + "'>" + self.items[index].label + "<a tabindex='0'>&times;</a></span>";
      }).join(""));
    },
    
    render: function(){
      var self = this;

      this.element.find('.amp-tag').remove();
      this.element.append(this.selected.map(function(index){
        return "<span class='amp-tag' data-index='" + index + "'>" + self.items[index].label + "<a tabindex='0'>&times;</a></span>";
      }).join(""));

      return this;
    }
  });

  $(function () {
    $(document.body)

    .delegate('.amp-panel', {
      mousedown: function(e){
        // Prevent blurring when the panel is clicked
        e.preventDefault();
      }
    })
    
    .delegate('.amp-list', {
      mousedown: function(e){
        // Fixes a bug in IE that blurs the control when a scrollbar is clicked
        (e.target === this) && ($(this).amp().parent) && ($(this).amp().parent.__noblur = true);
      }
    })
    
    .delegate('.amp-select:not([disabled])', {
      click: function (e) {
        $(this).amp().show();
      },
      blur: function(e){
        var amp = $(this).amp();
        amp.__noblur ? (amp.__noblur = false) : amp.hide();
      },
      keypress: function(e) {
        var amp = $(this).amp();
        amp.list && amp.list.__keypressHandler(e);
      },
      keydown: function(e){ 
        return $(this).amp().keydown(e); 
      }
    })
    
    .delegate('.amp-combo:not([disabled])', {
      mousemove: function(e){
        // Shows the pointer when we mouse over the small arrow on the right
        var self = $(this), o = self.offset(), width = self.outerWidth(true);
        if (o.left + width >= e.pageX && o.left + width - 20 <= e.pageX && o.top <= e.pageY && o.top + self.outerHeight(true) >= e.pageY){
          this.style.cursor = 'pointer';
        }
        else {
          this.style.cursor = '';
        }
      },

      click: function(e){
        // Opens the list if we click on the small arrow on the right
        if(this.style.cursor !== 'pointer') {
          return;
        }
        var self = $(this), amp = self.amp();
        if( amp.options.ajax ) {
          amp.list.once('ajaxend', function(){ 
            amp.show(); 
          });
          amp.list.reset(amp.getAjaxURL(self.val(), false, true));
        }
        else {
          amp.show();
        }
      },

      blur: function(e){
        var self = $(this); 
        var amp = self.amp();
        
        this.value === '' && amp.val(null);
        amp.hide().__reformat();
      },

      keydown: function(e){ 
        return $(this).amp().keydown(e); 
      }
    })

    .delegate('.amp-tag a', {
      click: function(){
        var taglist = $(this).parents('.amp-tags').amp();
        taglist.options.disabled || taglist.__set([parseInt($(this).parent().data('index'), 10)], false, true);
      },
      keypress: function(e){
        if(e.which === Amp.keys.ENTER || e.which === Amp.keys.SPACE){
          $(this).click();
          e.preventDefault();
        }
      }
    });
  });

  Amp.controls.select = Select;
  Amp.controls.combo  = Combo;
  Amp.controls.tags   = Tags;
  Amp.registerMethods(['hide', 'show', '__reformat', 'keypress', 'item', 'renderTags']);
})( window.jQuery || window.ender, window.Amp );

/**
 * Amp List Widget.
 *
 * Used as a standalone list and 
 * a part of the Select and Combo controls.
**/
;(function($, Amp){
  // A guid counter for list items that belong to lists without IDs
  var GUID = 0;
   
  /**
   * List control constructor.
   * The list control is used by Select and Combo, but can also be a standalone list.
   * In the standalone version it looks and behaves mostly like the HTML multiple Select element.
  **/
  function List(element, options){
    var value, list;
    
    element[0].id || element.attr('id', GUID++);
    options = _.extend({
      standalone: true,    // If true, the list behaves as a control (can be focused, events can be bound, etc...)
      multiple:   false,   // Whether multiple elements can be selected
      nullable:   false,   // Whether a null selection can be made (no elements selected)
      filter:     null,    // Filter function decides what items are displayed      
      renderer:   null,    // The default renderer, if null, defaults to the list's prototype method 'renderItem'
      renderers:  {},      // List of render functions to use for the item's "render" property
    }, options || {});

    value = 'value' in options ? options.value : [];
    delete options.value;

    list = Amp.createObject(List.proto, Amp.controls.control(element, options || {}, !options.standalone));
    list.element.addClass('amp-list');

    list.selected = [];
    list.reset(options.items, true);
    list.selected = list.__normalizeSelection(value);

    if( list.options.standalone ){
      list.element.attr('tabindex', 0);
      list.render();
    }
    return list;
  }

  var seek = "", to = 0;
  List.proto = Amp.createObject(Amp.controls.control.proto, {
    /** 
     * Handles keypress events for lists.
     * Keypresses are used to use fast seeking of the desired item in long lists
     * This method can be called from a jquery delegated event, or manually.
    **/
    __keypressHandler: function(e) {
      var foc, key;
      if(!(key = e && e.which)){
        return;
      }
      to && clearTimeout(to);
      to = setTimeout(function(){ 
        seek = "", to = 0; 
      }, 500);
      seek += String.fromCharCode(key).toLowerCase();
      foc = this.focusElement();
      this.focusItem(this.findByLabel(seek, true));
      foc === this.focusElement() || this.scrollToItem(this.focusElement());
    },
    
    /**
     * Normalizes a selection array.
     * It will always return an array containing only valid indices
     * of items that are part of the list.
     * The input should be an index (integer), an item's value (string) or 
     * an array containing a mix of values and/or indices.
     *
     *  Examples:  
         list.items = [ {value: "MK", label: "Macedonia"}, { value: "IT", label: "Italy" }, { value: "US", label: "America"} ]
         
         list.__normalizeSelection(["MK", "IT"])  => [0, 1]
         list.__normalizeSelection(["FR", "UK"])  => []
         list.__normalizeSelection([0, "US"])     => [0, 2]
         list.__normalizeSelection(["US", "MK"])  => [0, 2]
         list.__normalizeSelection(2)             => [2]
         list.__normalizeSelection("US")          => [2]
         list.__normalizeSelection(null)          => []
     *
    **/
    __normalizeSelection: function(selection) {
      var i, j, c, item, sitem;
      
      selection = (typeof selection !== 'number' && !selection) ? [] : _.isArray(selection) ? selection : [selection];
      selection = _.uniq(selection.sort(), true);

      i=0;
      while(sitem = selection[i++]){
        if(typeof sitem === 'number'){
          if(sitem >= this.items.length || sitem < 0){
            selection.splice(--i, 1);
          }
          continue;
        }
        j = 0;
        c = false;
        while(item = this.items[j++]){
          if(sitem === item.value){
            selection.splice(i-1, 1, j-1);
            c = true;
            break;
          }
        }
        if(c){
          continue;
        }
        selection.splice(--i, 1);
      }
      return selection.sort();
    },
    
    /** 
     * Private getter
     * @return Array List of selected indexes
    **/
    __get: function() {
      return this.selected.slice();
    },

    /* Private setter
     * Accepts a list of indexes and/or values or a single value/index.
     * The items with the said indexes/values will be selected. 
     * Values must be strings, indexes must be numbers.
     *
     * @param Mixed selection The items to be selected
     * @param Boolean silent If true, no events will be emitted
     * @param Boolean multi If true, the selection should be added/removed from current selection
     *
     * @return this
     */
    __set: function(selection, silent, metaKey) {
      var i, j, id  = this.element[0].id;
      var multi     = this.options.multiple;
      var nullable  = this.options.nullable;
      var selection = this.__normalizeSelection(selection);

      if( !multi ){
        selection = selection.slice(0,1);
      }

      // The metaKey is used to add or remove items from the selection.
      // The "selection" will always contain 1 item if the metaKey was used.
      if(metaKey){
        if(this.selected.length === 1 && this.selected[0] === selection[0]){
          if(nullable) {
            selection = [];
          }
        }
        else if(this.selected.length === 1 && this.selected[0] !== selection[0]){
          if(multi) {
            selection = selection.concat(this.selected);
            selection.sort();
          }
        }
        else if((i = this.selected.indexOf(selection[0])) > -1) {
          selection = this.selected.slice();
          selection.splice(i, 1);
        }
        else {
          selection = selection.concat(this.selected);
          selection.sort();
        }
      }
      
      // If the selection is the same as the already selected items, return immediately
      if(selection.length === this.selected.length && _.difference(selection, this.selected).length === 0) {
        return this;
      }
      
      this.selected = selection;
      this.selected.sort();
      this.element.find('li.active').removeClass('active');

      for(i=0, j=selection.length; i<j; ++i) {
        this.element.find('#' + id + '-' + selection[i]).addClass('active');
      }

      silent || this.trigger('change');

      // Internal __change event used by controls that hook to lists (select/autocomplete)
      this.options.standalone || this.trigger('__change');
      return this;
    },

    /* Finds the index of the item whose label contains @part
     * If @startswith is true, the label must start with @part.
     * Case insensitive. Returns -1 if no matching item is found.
     */
    findByLabel: function(part, startswith) {
      var ix, i=0, item;
      while(item = this.items[i++]){
        ix = item.label.toLowerCase().indexOf(part);
        if(startswith ? ix === 0 : ~ix){
          return i-1;
        }
      }
      return -1;
    },
    
    // Finds the index of the item whose value is @val
    findByValue: function(val) {
      for(var items = this.items, i=0, j=items.length; i<j; ++i) {
        if( items[i].value === val ) {
          return i;
        }
      }
      return -1;
    },
    
    // Gets or sets the focused <li> element
    focusElement: function(element) {
      if(element === undefined) {
        return this._focused;
      }
      this._focused && this._focused.removeClass('focused');
      this._focused = element && element.addClass('focused');
      return this;
    },
    
    /** 
     * Focuses on the item with specified index or to the next/previous item.
     * If we focus the next/previous item and nothing is focused, then we use the 
     * selected item as a reference; if there is no selection then we use the first/last item.
     *
     * @param Mixed index Can be a LI element, the string literals '+' and '-', and a number.
     * @return this
    **/
    focusItem: function(index) {
      var nf, id = this.element.get(0).id, fo = this.focusElement();
      
      if(index === '+') {
        index = fo ? $(fo.next()) : [];
        if(fo && !index.length) {
          return this; // Do not focus on next if we reached the last
        }
        index = index.length ? index : $('#' + id + "-" + this.selected[this.selected.length-1]);
        index = index.length ? index : $('ul', this.element).children(":first");
      }
      else if(index === '-') {
        index = fo ? $(fo.prev()) : [];
        if(fo && !index.length) {
          return this; // Do not focus on prev if we reached the first
        }
        index = index.length ? index : $('#' + id + "-" + this.selected[0]);
        index = index.length ? index : $('ul', this.element).children(":last");
      }

      nf = index instanceof jQuery ? index : $('#' + id + "-" + index);
      if(nf.length && nf[0] != (fo && fo[0])) {
        this.focusElement(nf);
      }
      return this;
    },
    
    /* Handles the keydown event. 
     * This works for the up/down arrows, and the Return key.
     * @param Object e A jQuery event object
     *
     * @return Boolean If false, the event propagation should be stopped.
     */
    keydown: function(e) {
      switch(e.which) {
        case Amp.keys.UP:
          this.focusItem("-");
          this.scrollToItem(this.focusElement());
          return false;
        case Amp.keys.DOWN:
          this.focusItem("+");
          this.scrollToItem(this.focusElement());
          return false;
        case Amp.keys.ENTER:
          this.focusElement() && this.__set(parseInt(this.focusElement().data('index'), 10), false, e.metaKey);
          this.trigger('itemclick');
          return false;
        default:
          break;
      }
    },
    
    // Scrolls the list to the item with specified index
    scrollToItem: function(index) {
      var el = this.element;
      var li = isNaN(index) ? index : $('#' + el[0].id + "-" + index);
      if(li.length) {
        var hi = el.height();
        var st = li.position().top;
        var he = li.outerHeight(true);
        var fi = $(el[0].childNodes[0]).position().top;
        el.scrollTop(st - fi - (hi - he) / 2);
      }
      return this;
    },

    /**
     * Resets the list's items with the new set.
     *
     * @param Mixed   `items`    The new set of list items or an Ajax url to load them
     * @param Boolean `silent`   If true, no *reset* event will be emitted
     * @param Boolean `discard`  If true, the value will be set to null after the reset and a change event won't be emitted.
     * @return this 
     */
    reset: function(items, silent, silenceChange) {
      var self = this;
      var oldValue = this.toJSON();
      
      this._focused = null;
      
      function handleValues(items){
        self.items = items;
        self.__set(oldValue, silenceChange);
        self.options.standalone ? self.render() : self.trigger('__change');
        silent || self.trigger('reset');
      }
      
      // Plain array
      if(_.isArray(items)) {
        handleValues(items);
      }
      
      // Passing a jquery SELECT as the item list
      else if(items instanceof $) {
        handleValues(items.find('option').map(function(i, option){ return { value: option.value, label: option.innerHTML }; }).toArray());
      }

      // Load via Ajax
      else if(typeof items === 'string') {
        if(this.__curajax) {
          this.trigger('ajaxend');
          this.__curajax.abort();
        }
        this.trigger('ajax');
        this.__curajax = $.ajax(items, {
          dataType: 'json',
          cache: false,
          success: function(items){
            self.__curajax = null;
            handleValues(items);
            self.trigger('ajaxend');
          },
          error: function(){
            self.__curajax = null;
            handleValues([]);
            self.trigger('ajaxend');
          }
        });
      }
      
      // There is no other option
      else {
        throw "List items should be a jQuery SELECT element, an URL or an array: " + this.element.get(0).id;
      }

      return this;
    },
    
    /**
     * Renders the list items
     *
     * @return Number Number of rendered items.
     */
    render: function(){
      var id     = this.element[0].id;
      var sel    = this.selected;
      var html   = []; 
      var count  = 0;
      var opts   = this.options;
      var filter = opts.filter; 

      this.items.forEach(function(item, ix){
        if(filter && !filter.call(this, item)) {
          return;
        }
        var r = (item.renderer && opts.renderers[item.renderer]) || opts.renderer;
        html.push( "<li class='ampli", (~sel.indexOf(ix) ? " active" : ""), "' id='", id, "-", ix,"' data-index='", ix, "'>", r ? r.call(this, item) : item.label, "</li>");
        ++count;
      });

      this.element.html("<ul>" + html.join("") + "</ul>");
      return count;
    },

    // Returns a JSON representation of the selected values
    toString: function() {
      return JSON.stringify(this.toJSON());
    },
    
    toJSON: function() {
      return this.selected.map(function(i){ return this.items[i].value; }, this);
    }
  });
  
  // Bindings
  $(function () {
    // Prevents firing mouseover events if mouse hasn't moved
    var mx, my;
    $(document.body)
    .delegate('.ampli', {
      // TODO: Remove support for IE 8 and change this to 'click'
      mousedown: function (e) {
        if( e.button !== 0 ) {
          return; // Register only left clicks
        }
        var li = $(this), list = li.parents('.amp-list').amp();
        list.focusElement(li);
        list.__set(parseInt(li.data('index'), 10), false, e.metaKey);
        list.trigger('itemclick');
      },
      mousemove: function(e){ 
        mx = e.pageX; 
        my = e.pageY;
      },
      mouseover: function(e){
        if(e.pageX !== mx || e.pageY !== my){
          var li = $(this);
          li.parents('.amp-list').amp().focusElement(li);
        }
        mx = e.pageX, my = e.pageY;
      },
      mouseout: function(e){
        if(e.pageX !== mx || e.pageY !== my){
          $(this).parents('.amp-list').amp().focusElement(null);
        }
      }
    })
    .delegate('.amp-list', {
      mousewheel: function(e) {
        // Prevents window from scrolling after we reached the end of the list.
        if((this.scrollTop === (this.scrollHeight - $(this).height()) && e.originalEvent.wheelDeltaY < 0) || (this.scrollTop === 0 && e.originalEvent.wheelDeltaY > 0)) {
          e.preventDefault();
        }
      },
      keypress: function(e) {
        // This will look through item labels when you start typing letters.
        $(this).amp().__keypressHandler(e);
      },
      keydown: function(e){ 
        // Proxy for the custom keydown methods
        return $(this).amp().keydown(e); 
      }
    });
  });

  Amp.controls.list = List;
  Amp.registerMethods(['findByLabel', 'findByValue', 'focusElement', 'keydown', 'scrollToItem', 'reset', 'render', '__keypressHandler']);
})(window.jQuery || window.ender, window.Amp);

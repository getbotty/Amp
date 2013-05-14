/**
 * Amp Grid Plugin 
 * 
 * Requires Backbone.js
**/
"REQUIRE backbone >= 1.0.0";

;(function($, Amp){
  var guid   = 0;
  var cache  = {};
  var inputs = {};
  var directions = { '38': [0, -1], '40': [0, 1], '9': [1, 0], '37':[-1, 0], '39': [1, 0] };

  function makeAttrs(dict){
    if( _.isObject(dict) ) {
      return _.map(dict, function(val, key){ return key + '="' + val + '"'; }).join(" ");
    }
    return "";
  }

  function Grid(container, options){
    var grid = Amp.createObject(Grid.proto, {
      guid:        guid++,
      src:         options.datasource,
      container:   container,
      element:     $('<table style="width:100%" class="amp-grid" cellspacing="0" cellpadding="0"><thead></thead><tbody></tbody></table>'),

      _editedItem:   null,
      _columnsOrder: [],    // Keeps the order of the columns
      _columns:      {}     // Keeps reference to the column settings
    });

    grid.head = $('thead', grid.element);
    grid.body = $('tbody', grid.element);
    
    /**
     * Listen to `change` events in the datasource
     * and update the grid cells if needed.
    **/
    grid.src.on('change', function(item){
      var row = $('tr#grid-' + grid.guid + '-' + item.cid);
      for(prop in item.changed){
        if(prop in grid._columns){
          $('td[data-prop="' + prop + '"]', row).replaceWith( grid._formatCell(item, prop) );

          if(grid._columns[prop].alsoChange) {
            _.map(grid._columns[prop].alsoChange, function(also){
              
              if(also !== prop && (also in grid._columns)) {
                $('td[data-prop="' + also + '"]', row).replaceWith( grid._formatCell(item, also) );
              }

            });
          }
        }
      }
    }).on('add remove reset', function(){
      grid.render();
    });

    grid.setColumns(grid.src.grid.columns)
    grid.setPagination(grid.src.grid.pagination);
    grid.setSorting(grid.src.grid.sorting);

    // Add to the DOM
    grid.element.appendTo(grid.container);
    
    // Put this grid instance in the cache
    return cache[grid.guid] = grid;
  }


  Grid.proto = {
    /**
     * Modifies the column settings for the grid.
     * The argument `c` should be in the following form:
         [{
           id:       'date',
           type:     'date',  // Also text, number, boolean, enum, composite
           title:    'Date',
           format:   'yy-mm-dd',
           editable: true,
           sortable: true,
           content:  function(item){}
         }]
     * 
     * The `sortable` property can also be a function that accepts the Backbone collection object.
     * When the grid is rendered, the column will be sortable if the function returns true.
     * 
     * The `editable` property can also be a function that accepts the backbone model instance representing the row.
     * When the grid is rendered, the column will be editable if the function returns true.
    **/
    setColumns: function(c){
      this._columnsOrder = _.pluck(c, 'id');
      this._columns      = _.object(this._columnsOrder, c);
      return this;
    },

    /**
     * Modifies the pagination settings for the grid.
     * The argument 'p' should be in the following form:
       {
         pageSize: 3,     // How many items to display on each grid page
         dataSize: 9,     // How many total items are in the collection.
         sizeAttr: 's',   // The name of the querystring attribute for the page size.
         pageAttr: 'p'    // The name of the querystring attribute for the page number.
       }
     * The pagination is made to work with Ajax. It will always display the whole collection.
     * When changing pages, you should use fetch() on your collection to load a new set of results.
     * The following method needs to be defined in your Backbone collection. 
     * It should handle the page switching and call 'reset':
         gridPage: function(page, query){
           // `page` is the requested page
           // `query` is the querystring that takes into account the current sorting as well
         }
     *
    **/
    setPagination: function(p){
      if(!p) {
        delete this._pagination;
        delete this._currentPage;
        delete this._totalPages;
        delete this._pageMethod;
        delete this._pageLinks;
        return this;
      }
      var oldTP = this._totalPages;
      
      this._currentPage = 1;
      this._pagination  = _.extend(this._pagination || {}, p);
      this._totalPages  = Math.ceil(this._pagination.dataSize / this._pagination.pageSize);
      this._pageMethod  = this.src[ p.method || 'gridPage' ];
      this._pageLinks   = parseInt(this._pagination.links, 10);

      isNaN(this._pageLinks) && (this._pageLinks = 7);
      
      if(!_.isFunction(this._pageMethod)) {
        throw "No page method found in grid pagination settings";
      }
      
      if(oldTP !== this._totalPages) {
        this._makeFooter();
      }
      return this;
    },
    
    /**
     * Modifies the sorting settings for the grid.
     * The argument 's' should be in the following form:
       {
         initialCol: 'date',  // Optional, the initial sorting column
         initialDir: 'desc',  // Initial sorting direction. Defaults to 'asc'
         colAttr: 'c',        // The name of the querystring attribute for the sort column.
         dirAttr: 'd'         // The name of the querystring attribute for the sort direction.
       }
     * The following method needs to be defined in your Backbone collection. 
     * It should handle the sorting and call 'reset':
         gridSort: function(column, dir, query){
           // `column` is the sorting column id
           // `dir` is the sorting direction
           // `query` is the querystring that you can use for ajax
         }
     * 
    **/
    setSorting: function(s){
      var self = this, firstCol = _.find(this._columnsOrder, function(col){ return self._columns[col].sortable });

      if(!s || !firstCol){
        delete this._sorting;
        delete this._sortCol;
        delete this._sortDir;
        delete this._sortMethod;
        return this;
      }

      this._sorting = _.extend(this._sorting || {}, s);
      this._sortCol = s.initialCol || null;
      this._sortDir = s.initialDir || null;
      this._sortMethod = this.src[ s.method || 'gridSort' ];

      if(!_.isFunction(this._sortMethod)) {
        throw "No page method found in grid pagination settings";
      }

      return this;
    },

    /**
     * Sets additional parameters to be sent when pagination/sorting is requested.
     * These can be used to apply and maintain a filter
    **/
    setParams: function(p){
      if(!_.isObject(p)) {
        delete this._extraParams;
        return this;
      }
      this._extraParams = p;
      return this;
    },
        
    /**
     * Renders the table in its entirety.
     * Each row has an `id` attribute in tho following form: id="grid-<grid guid>-<item backbone cid>"
     * Each cell has a data property data-prop="<column name>"
    **/
    render: function(){
      var i, active, item, offset = 0, self = this, html = "", rowattrs, rowAttrs = this.src.grid.rowAttrs;

      this._makeHeader();
      for(i=offset; i < this.src.length; ++i){
        item = this.src.at(i);
        
        rowattrs = (_.isFunction(rowAttrs) ? rowAttrs(item) : rowAttrs) || {};
        rowattrs.id = 'grid-' + this.guid + '-' + item.cid;

        html += "<tr " + makeAttrs(rowattrs) + ">";
        html += _.map(self._columnsOrder, function(id){ return self._formatCell(item, id); }).join("");
        html += "</tr>";
      }
      this.body.html(html);
      this._makeFooter();
      return this;
    },

    /**
     * Hides the grid
    **/
    hide: function(){
      this.body.parent().css('display', 'none');
      return this;
    },

    /**
     * Shows the grid
    **/
    show: function(){
      this.body.parent().css('display', '');
      return this;
    },

    // PRIVATE METHODS

    /**
     * Creates the header of the table.
     * Each cell has a data property data-prop="<column name>" and additional 
     * properties defined in thAttrs.
    **/
    _makeHeader: function(){
      var self = this;
      this.head.html("<tr data-grid='" + this.guid + "'>" +        
        _.map(this._columnsOrder, function(id){
          var attrs, sorter = "", info = self._columns[id];

          if(_.isFunction(info.sortable) ? info.sortable(this.src) : info.sortable){
            sorter = (id === self._sortCol && self._sortDir === 'desc') ? "desc" : "asc";
          }
          attrs =  makeAttrs({ 'class': (sorter ? 'sortable ' + (id === self._sortCol ? sorter : '') : ''), 'data-prop': id });
          attrs += makeAttrs(_.isFunction(info.thAttrs) ? info.thAttrs(this.src) : info.thAttrs);

          return "<th " + attrs + ">" + info.name + "</th>";
        }, this).join("") +
      "</tr>");
    },

    /**
     * Creates the footer of the table.
     * This is automatically called when the pagination settings are changed.
    **/
    _makeFooter: function(){
      var i, max, html, active, footer, links;

      if(!this._pagination) {
        return;
      }

      if((footer = $('tr.footer', this.body)).length === 0) {
        footer = $("<tr class='footer'></tr>").appendTo(this.body);
      }

      html = "<td class='paginator' colspan='" + this._columnsOrder.length + "'>";
      html += "Page <input data-grid='" +  this.guid + "' value='" + this._currentPage + "'> of <b>" + this._totalPages + "</b> &nbsp; ";
      
      links = Math.min(this._pageLinks, this._totalPages);
      i     = Math.min(Math.max(1, this._currentPage - Math.floor(links / 2)), this._totalPages - links + 1);
      max   = i + links;
      for(; i < max; i++){
        active = (i === this._currentPage) ? " active" : "";
        html += "<a data-grid='" + this.guid + "' data-page='" + i + "' class='amp-grid-page" + active + "'>" + i + "</a>";
      }
      
      footer.html(html);
    },
    
    /**
     * Handles the pagination
    **/
    _goToPage: function(page){
      var query, sorting = this._sorting, paging = this._pagination, page = parseInt(page, 10);

      if(page < 1 || page > this._totalPages) {
        return this;
      }
      
      query = paging.pageAttr + '=' + page + '&' + paging.sizeAttr + '=' + paging.pageSize;
      if(sorting && this._sortCol) {
        query += '&' + sorting.colAttr + '=' + this._sortCol + '&' + sorting.dirAttr + '=' + (this._sortDir || 'desc');
      }
      
      if(this._extraParams) {
        query += '&' + $.param(this._extraParams);
      }

      this._currentPage = page;
      this._pageMethod.call(this.src, page, query);
    },
    
    /**
     * Handles the sorting
    **/
    _sort: function(prop){
      var query, sortable = this._columns[prop].sortable, sorting = this._sorting;
      if(!sorting || !(_.isFunction(sortable) ? sortable(this.src) : sortable)) {
        return;
      }

      if( this._sortCol === prop ){
        this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
      }
      else {
        this._sortDir = 'desc';
        this._sortCol = prop;
      }

      if( this._pagination ){
        this._currentPage = 1;
      }
      
      query = sorting.colAttr + '=' + this._sortCol + '&' + sorting.dirAttr + '=' + (this._sortDir || 'desc');

      if(this._extraParams) {
        query += '&' + $.param(this._extraParams);
      }
      
      this._sortMethod.call(this.src, this._sortCol, this._sortDir, query);
    },
    
    /**
     * Returns the formatted string representation of the cell data
    **/
    _formatCell: function(item, prop){
      var info      = this._columns[prop];    
      var className = info.type || 'text';
      var action    = _.isFunction(info.action) ? info.action(item) : _.isObject(info.action) ? info.action : null;
      var attrs;
      var value;

      if (info.type == 'enum')
        value = item.get(prop);
      else
        value = _.isFunction(info.content) ? info.content(item) : item.get(prop);

      // Custom actions override editable
      if(action && action.icon) {
        className += ' action ' + action.icon;
      }
      else if( _.isFunction(info.editable) ? info.editable(item) : info.editable ) {
        className += ' action editable';
      }
      attrs = makeAttrs({ 'data-prop': info.id, 'class': className });

      switch(info.type) {
        case 'number': 
          value = typeof value === 'number' 
            ? value === 0
              ? ('falsy' in info ? info.falsy : value.format(info.format || 0))
              : value.format(info.format || 0)
            : ('falsy' in info ? info.falsy : "");
          break;
        case 'date': 
          value = Date.formatDate(info.format, value); 
          break;
        case 'boolean':
          value = value ? 'True' : 'False';
          break;
       case 'enum':
          value = info.items ? _.find(info.items, function(e){ return e.value === value; }) : value;
          
          if (!value && 'falsy' in info)
            value =  info.falsy;
          else {
            if (_.isFunction(info.content))
              value = info.content(item);
            else 
              value = value.value;
          };

          break;
        default: 
          value = value ? value : ('falsy' in info ? info.falsy : value); 
          break;
      }
      
      return "<td " + attrs + ">" + value + "</td>";
    },
    
    /**
     * Handles the cell editing setup actions
    **/
    _editStart: function(cid, field){
      var item   = this._editedItem = this.src.get(cid);
      var column = this._columns[field];
      var td     = $('td[data-prop=' + field + ']', $('#grid-' + this.guid + '-' + item.cid));
      var w      = td.outerWidth();
      var h      = td.outerHeight();
      var p      = td.position();
      var parent = td.offsetParent();

      var input  = inputs[column.type];
      if(!input) {
        return;
      }
            
      // Offset parent returns document. We need body.
      if(parent[0].tagName === 'HTML') {
        parent = $(document.body);
      }
      
      if(input === inputs.enum) {
        input.reset(column.items, true, true);
      }
      else {
        input.setFormat(column.format);
      }
      input.val(item.get(field), true);
      
      // Store the input's current value
      item.__amp_input_prev = input.val();

      _.isFunction(column.editStart) && column.editStart.call(this.src, item, input);

      input.element.addClass('shown').appendTo(parent)
      
      if(input === inputs.enum) {
        input.render();
        input.element.css({ top: p.top - 3, left: p.left - 3 });
      }
      else {
        input.element.css({ 
          height: h - (input.element.outerHeight() - input.element.height()),
          width:  w - (input.element.outerWidth() - input.element.width()),
          top:    p.top,
          left:   p.left 
        });
      }

      input.__grid = this;
      input.__prop = field;

      if(input === inputs.date){
        input.show();
      }
      else if(input === inputs.enum) {
        input.focusItem(input.val()[0] || 0);
      }

      // Delay the focus() method till the next tick because it will
      // trigger another blur event calling this function again.
      setTimeout(function(){ 
        input.element.focus().select(); 
      }, 0);

      return input;
    },
    
    /**
     * Wraps up the cell editing actions
    **/
    _editEnd: function(field, input){
      var n, sel, column = this._columns[field]; 
      
      if( !this._editedItem ) {
        return;
      }

      var n = input.val();
      if(input === inputs.enum) {
        n = input.toJSON()[0] || null;
      }
      
      // Check if the input's value has changed.
      // We don't compare agains the item's value because the internal 
      // value of the item might have a different precision than its format.
      if(this._editedItem.__amp_input_prev !== n) {
        this._editedItem.set(field, n, { gridEdit: true });
      }
      _.isFunction(column.editEnd) && column.editEnd.call(this.src, this._editedItem, input);

      delete this._editedItem.__amp_input_prev;
      this._editedItem = null;

      // Deselect the selected text before blurring. 
      // This fixes a bug in IE that fires `blur` twice if text is selected.
    	if(sel = document.selection) {
    		sel.empty && sel.empty();
    	} 
      else if(sel = window.getSelection) {
    		sel.empty && sel.empty();
    		sel.removeAllRanges && sel.removeAllRanges();
    	}

      // Hide any datepickers
      input === inputs.date && input.hide();

      // Empty the input's value and detach the input
      input.val(null, true).element.removeClass('shown');

      // Set the "left arrow blur keypress" back to false
      input.__labk = false;
    },

    /**
     * Returns the `cid` of the row and the column name
     * that's supposed to be edited next after a navigation button is pressed.
     * It is determined relative to the currently edited cell.
    **/
    _getOffsetField: function(row, field, direction) {
      var f, i = -1, cols = this._columnsOrder, c = this._columns[field];

      if(direction[0]){
        while(c = cols[++i]) {
          c = this._columns[c];

          if(c.id !== field) continue;

          c = this._columns[cols[i += direction[0]]];
          do {
            // We got to the end of the columns, start over
            if(!c) {
              i = direction[0] > 0 ? -1 : cols.length;
            }
            // We found a candidate
            else if(_.isFunction(c.editable) ? c.editable(row) : c.editable) {
              field = c.id; 
              break;
            }
            // No other candidate found, look in next/prev row.
            else if(c.id === field) {
              break; 
            }
          } while (c = this._columns[cols[i += direction[0]]]);
          break;
        }
      }

      if(direction[1]){
        while(1){
          i = this.src.indexOf(row) + direction[1];
          i = i >= this.src.length ? 0 : i < 0 ? this.src.length - 1 : i;
          row = this.src.at(i);

          if(_.isFunction(c.editable) ? c.editable(row) : c.editable){
            break;
          }
          if(!row) {
            row = direction[1] > 0 ? this.src.first() : this.src.last();
            if(_.isFunction(c.editable) ? c.editable(row) : c.editable){
              break;
            }
          }
        }
      }

      return { cid: row.cid, field: field };
    }
  }
  
  /**
   * Grid module initialization and delegated event handlers
  **/
  $(function(){
    inputs.text   = $("<input class='amp-grid-input'>").amp('text', { validator: {} });
    inputs.number = $("<input class='amp-grid-input'>").amp('number', { validator: {}, format: 0 });
    inputs.date   = $("<input class='amp-grid-input'>").amp('date', { validator: {}, format: 'yy-mm-dd' });
    inputs.enum   = $("<div class='amp-grid-input amp-panel'></div>").amp('list', { items: [], multiple: false });
    
    // We would normally just pass direction to the trigger method
    // but there appears to be a bug in jQuery 2.0 that prevents
    // the extra arguments to reach the blur handler. 
    var direction = false;

    _.each(inputs, function(input, type){
      
      if(type === 'enum') {
        
        input.element.on({
          blur: function(e){
            var prop, grid, next, self  = $(this), input = self.amp();
            if(input.__innerClick) {
              return;
            }
            prop  = input.__prop;
            grid  = input.__grid;
            next  = direction && grid._getOffsetField(grid._editedItem, prop, direction);

            // Inform the grid that the editing ended.          
            grid._editEnd(prop, input);
            next && grid._editStart(next.cid, next.field);

            return direction = false;
          },
          keydown: function(e){
            var fe;
            
            if(e.which === Amp.keys.ESCAPE) {
              $(this).trigger('blur');
            }
            else if(e.which === Amp.keys.UP) {
              if((fe = input.focusElement()) && fe.is(':first-child')) {
                direction = [0, -1];
                $(this).trigger('blur');
                return false;
              }
            }
            else if(e.which === Amp.keys.DOWN) {
              if((fe = input.focusElement()) && fe.is(':last-child')) {
                direction = [0, 1];
                $(this).trigger('blur');
                return false;
              }
            }
            else if(e.which === Amp.keys.LEFT) {
              direction = [-1, 0];
              $(this).trigger('blur');
              return false;
            }
            else if(e.which === Amp.keys.RIGHT) {
              direction = [1, 0];
              $(this).trigger('blur');
              return false;
            }
            else if(e.which === Amp.keys.TAB) {
              direction = [e.shiftKey ? -1 : 1, 0];
              $(this).trigger('blur');
              return false;
            }
          }
        });
        return;
      }
      
      input.element.on({
        blur: function(e){
          var prop, grid, next, self  = $(this), input = self.amp();
          if(input.__innerClick) {
            return;
          }
          
          prop  = input.__prop;
          grid  = input.__grid;
          next  = direction && grid._getOffsetField(grid._editedItem, prop, direction);

          // Inform the grid that the editing ended.          
          grid._editEnd(prop, input);
          next && grid._editStart(next.cid, next.field);

          return direction = false;
        },

        keydown: function(e){
          var sel, tlen, caretPos, self = $(this);
          var len = this.value.length;

          direction = false;
          
          // Get Caret Position
          if ('selectionStart' in this) {   // Standards-compliant browsers
            caretPos = this.selectionStart;
          }
          else if (document.selection) {    // IE
            this.focus();
            sel  = document.selection.createRange();
            tlen = document.selection.createRange().text.length;
            sel.moveStart('character', -len);
            caretPos = sel.text.length - tlen;
          }

          if( e.which !== 13 ) {
            if( !(direction = directions[ e.which ]) ) return;
            if( e.which === 39 && caretPos !== len ) return;
            if( e.which === 37 && caretPos !== 0 ) return;
            if( e.which === 37 && caretPos === 0 && !input.__labk ) {
              // The __labk property indicates that we're at the edge of the selection. 
              // Pressing the arrow once more will change the edited field.
              input.__labk = true; 
              return;
            }
            if( e.shiftKey && e.which === 9 ) {
              direction = [-1, 0];
            }
          }

          self.trigger('blur');
          return false;
        }
      });
    });

    $('body')
    .delegate('table.amp-grid td.action', {
      click: function(){
        if(this.style.cursor === 'pointer') {
          var self = $(this); 
          var id   = self.parent().attr('id').split('-');
          var grid = cache[ id[1] ];
          var cid  = grid.src.get(id[2]);
          var prop = self.data('prop');

          var action, info = grid._columns[prop];
          if(action = _.isFunction(info.action) ? info.action( grid.src.get(cid) ) : _.isObject(info.action) ? info.action : null) {
            return action.handler(grid.src.get(cid));
          }          
          if( self.hasClass('editable') ) {
            grid._editStart(cid, prop).element.focus().select();
          }
        }
      },
      mousemove: function(e){
        // Shows the pointer when we mouse over the small arrow on the right
        var self = $(this), o = self.offset(), width = self.outerWidth(true);
        if (o.left + 20 >= e.pageX && o.left <= e.pageX && o.top <= e.pageY && o.top + self.outerHeight(true) >= e.pageY){
          this.style.cursor = 'pointer';
        }
        else {
          this.style.cursor = '';
        }
      }
    })
    .delegate('table.amp-grid td a.amp-grid-page', 'click', function(){
      cache[ $(this).data('grid') ]._goToPage( $(this).data('page') );
    })
    .delegate('table.amp-grid th.sortable', 'click', function(){
      cache[ $(this).parent().data('grid') ]._sort( $(this).data('prop') );
    })
    .delegate('table.amp-grid tr.footer input', 'keydown', function(e){
      if(e.which !== 13) {
        return;
      }
      
      var page = parseInt($(this).val(), 10);
      var grid = cache[ $(this).data('grid') ];
      
      (isNaN(page) || page < 1 || page > grid._totalPages) && (page = grid._currentPage);
      if(page === grid._currentPage) {
        $(this).val(page);
      }
      else {
        grid._goToPage(page);
      }
    });

  });

  
  Amp.controls.grid = Grid;
})(jQuery, window.Amp);

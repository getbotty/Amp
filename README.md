# Amp

Amp is a set of javascript extensions that amplify the native browser controls. It requires [jQuery](http://jquery.con) and [Underscore.js](http://documentcloud.github.com/underscore/). For the *grid* module you will also need [Backbone](http://backbonejs.org/).

Amp gives you:

- Simplifeid interface for binding events to form controls
- A *type* event that fires on keypress, but only when the value changes.
- Consistent enabling and disabling of inputs.
- A Date and a Number input that work with native types.
- An as-you-type formatted number input.
- A datepicker for date inputs.
- A better select, multiple select and combo controls that work with Javascript/JSON, can be serialized and styled.
- A modal window with its own tabbing order.
- A tooltip.
- A sortable, editable and paginated grid control.
- Extensions to the Number and Date native objects.

Amp was made to deal with complicated forms for banking applications with controls that change states often and based on many variables.

# Syntax overview
	
    // Make an Amp control from an existing element
    var myDate = $('#my-date').amp("date", { format: "yy-mm-dd" });
    
    // Or an element outside the DOM
    var myInt = $('<input type="text">').amp("number", { format: 2 });

    // Getting a reference to an existing amp control
    $('#an-element').amp();
    console.log(myDate === $('#my-date').amp()); // Prints 'true'

    // Make amp controls of multiple jquery elements at once
    var manyButtons = $('.buttons').amp("button").on('click', function(e){ 
      alert(this.element.data('message'));
    });
    
    // Get or set the value of a control
    myDate.val();				// Returns a date object or `null`
    myDate.val(new Date());  	// Sets the date and updates the <input> with the correct format

# Usage

Be sure to include jQuery 1.9.1, BackboneJS 1.0.0 and Underscore 1.4.4. Then drop the `build` folder in your project and just add the following tags to your HTML page:

	<script src="/build/scripts.js"></script>
	<link rel="stylesheet" href="/build/styles.css">

# Demo 
[http://discobot.net/en/posts/amp-demo](http://discobot.net/en/posts/amp-demo)

# FAQ

**Q:** Is Amp used in production?  
**A:** Amp is used in 2 web application made for internal use by ProCredit Bank.

**Q:** Why don't you provide validation for the controls?  
**A:** Validation should be done in the model and then reflected on the controls. We use Backbone.js for our models.

**Q:** What Licence does Amp use?
**A:** MIT

# General

These are the general events, methods and options that apply to all Amp controls.

#### Events

Every Amp control can listen to and trigger a set of events. 

Events are bound to controls using the `.on()` method or its alias 'bind()'. Events are triggered by a user action or programatically, using the `.trigger()` method. For example:

	myDate.on('change', function(){
		console.log(this.val());    // This will log the new date value everytime it changes
	});
	myDate.trigger('change');       // This will execute all the 'change' listeners in order

The `on()` method accepts a third argument which is an array of values. These values will **always** be passed to the listener.

	myDate.on('change', function(){
		console.log(this.val());
	}, [1]);

The arguments you pass the the `trigger()` method will be concatenated to the arguments you passed to the `on()` method and passed to the event callback. For example:

    myDate.on('click', function(one, two, three){
    	console.log(three === one + two);
    }, [1]);
    myDate.trigger('click', 2, 3); // Prints "true"

The value of **this** inside the callback will be bound to the Amp object.  
You can use multiple event names separated by a space to bind a listener to multiple events.

	myDate.on('change type', function(){});

If you want to unbind a listener use the `off()` method or its alias `unbind()`. You need to pass the event name and a reference to the listener function. If you only pass the event name which is **DANGEROUS**, you will unbind all listeners for that particular event.

	var listener = function(){}
	myDate.on('change', listener);
	
	myDate.off('change', listener);		// Unbinds the specific listener
	myDate.off('change'); 				// Unbinds all listeners

You can use the `off()` method do execute listeners only once:

	myDate.on('change', function(){
		this.off('change', arguments.callee);
		// Do something once
	});

#### Options

When you initialize an amp control, you can pass it a set of options. The following options are shared by all Amp controls:

- **disabled** - If true, the control will be disabled.
- **value** - The inital value of the control.
- **linkTo** - This can be a jQuery input element or an ID of a DOM element. The value of the Amp control will be synchronized with the value of the element. At page load, if the **linkTo** element has a value, the control will always take its value. This is useful when you need to connect Amp controls with hidden inputs.

#### Methods

These methods are shared by all Amp controls

`val([newval, silent])`  
If called with no arguments, it will return the value of the control. If a value is passed for **newval** it will be set to control. A `change` event will be fired if the new value is different from the old one. If the **silent** argument is true, the **change** event will be suppressed. Every Amp contorl returns a respective data type or `null`. The `null` value is visually represented with an empty input. 

`on(evName, evCallback, [args])`  
Binds an event listener. More about this method in the General > Events section

`off(evName, evCallback)`  
Unbinds an event listener. More about this method in the General > Events section

`trigger(evName, [arg1, arg2, …])`  
Triggers an event. More about this method in the General > Events section

`disable()`  
Disables the control. Disabled controls can't be interacted with and have a semi-transparent look. The can't be focused or tabbed into. However, you can continue to use them programatically. 

`enable()`  
Enables the control.

`toString()`  
Returns a string representation of the control's value.

`showTip(title, placement)`  
Shows a tooltip with the title passed. Placement can be "above", "below", "left" or "right". Tooltip code thanks to Tiwtter Bootstrap.

    myDate.showTip({ title: "This field is required", placement: "above|below|right|left" });

`hideTip()`  
Hides the tooltip. Or does nothing if it's hidden.

#### Properties

Every Amp object will have the following properties

- **element** - A reference to the jQuery element
- **options** - The initial options that you passed. This is read only, or better yet, treat it as private.


# Simple Elements

## Button
Used for click input. There are 2 types of buttons: *normal* and *toggle-able* (*checkbox* and *radio*).

Buttons should be made out of &lt;button&gt; DOM elements. Toggle-able buttons have the class `active` when they are activated. You can use this class to style them.

**Note:** Radio buttons must come in groups. You can't have a single radio button. Make a group of radios by giving them the same `name` attribute. For example:

	<button name="radios" id="radio1">Option 1</button>
	<button name="radios" id="radio2">Option 2</button>

This is how you initialize the button controls:

	$('#radio-button').amp("button|checkbox|radio", { … options … });

#### Options

Besides the general options, the toggle-able buttons also have:

- **active** - If true, the button will be turned on by default.

#### Events

`click`  
Is fired when a button is clicked. Simple as that.

`change`  
Is fired when a button's state changes (for checkboxes and radio buttons). Note that when you work with radio buttons, turning a radio button on will turn off any other radio button in its group, firing the respective *change* events.

#### Methods

`toString()`  
Returns the string value of the button. If the button is active, returns `"1"`, otherwise returns an empty string `""`

`val([newval, silent])`  
Use this method to get/set the value of a checkbox or radio button. It will return `true` if the button is active, otherwise `false`.


## Inputs
Inputs are used for keyboard input. You make them out of &lt;input&gt; DOM elements.

	var myInput = $('#my_input').amp("text|number|date", {
		format: "(0-9)|yy-mm-dd|/regular expression/",
	});

	myInput.on('type', function(){
		$('label').val( this.val() );
    });

There are 3 types of inputs: `text`, `number` and `date`.

- The *text* input is a normal input
- The *number* input accepts only numbers and formats them with thousand separators as 
  you type
- The *date* input shows a datepicker calendar and accepts dates.
	

#### Options

- **format** - For *number* inputs it's the number (defaults to `0`) of decimal places. If set to `0` there will be no decimal places so the input will accept only integers.  
For *text* inputs it's a regular expression that will prevent text not matching it to be entered (it will be reset on change).  
For *date* inputs it's the date format of the input field. The format can be combinations of the following:

		d  - day of month (no leading zero)
		dd - day of month (two digit)
		o  - day of year (no leading zeros)
		oo - day of year (three digit)
		D  - day name short
		DD - day name long
		m  - month of year (no leading zero)
		mm - month of year (two digit)
		M  - month name short
		MM - month name long
		y  - year (two digit)
		yy - year (four digit)
		@ - Unix timestamp (ms since 01/01/1970)
		! - Windows ticks (100ns since 01/01/0001)
		'...' - literal text
		'' - single quote

- **max** - This option works with *date* and *number* inputs only. It will prevent the input to take a value greater than this.
- **min** - Look at *max*.
- **validator*** - This option works for `date` inputs only. It can be an function or a hash or array of functions. The functions will be called and passed a date. All of them need to return `true` in order to allow the date to be selected. The datepicker calendar will not allow clicking on dates that don't pass all the validator function.
- **range** - This option also works only for the `date` inputs. It's a string in the form "nn", "-nn" or "+nn" and it sets the year range available for selection in the calendar. The range is set as the currently selected date's year +/- nn years.
- **language** - Not implemented

#### Events

- `type` is fired after every keypress but only if the value changes. It will not fire if you, for example, press shift or paste text over the exact same text. The `type` event passes 2 arguments to the callback `(newVal, event)` - the new value of the HTML input element, which is always a string after the keypress and a reference to the jQuery keypress event.

- `change` is fired after the field loses focus, only if its value has changed and no `beforechange` handlers returned false.

Example: Firing a change event as you type.

    $('#my-input').amp().on('type', function(){ this.trigger('change'); });


#### Methods

`val([newValue, silent])`  
Retrieves the value. If `newValue` is passed, the method acts as a setter. If `silent` is passed as `true`, the change of the value does not fire any events. The `val()` method will always return String for text inputs, Number for number inputs and Date for date inputs. You also need to pass the correct type to it.

`setFormat([format])`  
Sets the formatting of the input to something else. Passing null for text inputs will remove the regexp check. 

`show()`  
Shows the datepicker calendar. Naturally, it only works for datepickers.

`hide()`  
Hides the datepicker calendar.

`clamp(min, max)`  
Sets the min and the max options of *date* and *number* inputs. Passing null for any of those removes the constraint.


# List-type controls

Amp provides a flexible set of list controls. There is the common dropdown, a combo box, a normal miltiple-select and a multiple tag select. The lists optios defined with JSON and are completely stylable with css.

## List Items

List items are the data objects representing the items displayed in lists. They are used only by list-type controls in Amp - the *list*, *select*, *combo* and *tag* controls.

List items are ordinary Javascript objects. For example, here's a collection of list items:

		[{value: "MK", label: "Macedonia"}, {value: "UK", label: "United Kingdom"}]

#### Properties

The following properties are **required**:

- **value** - Must always be a string. The value of the list item.
- **label** - Will be displayed as the label for the list item.

Optional properties for items:

- **renderer** - This must be a string. If set, Amp will look in the list `options.renderers` hash and it will expect a function that will be used to render the item.

All other properties are ignored by Amp, but you can use them in your code for storing various data.

## List

The basic list is simple - it looks like the standard HTML multiple select. Lists support keyboard actions: you can start typing while the list is in focus and it will scroll to the item that spells out what you typed.

#### Properties

- **items** - the array of list items.

#### Options

- **items** - An array of list items (see List Items); This can also be a jQuery &lt;select&gt; element and the items will be extracted from the &lt;option&gt; elements.
- **multiple** - If true, this list will support selection of multiple items by holding the ctrl (command) key while selecting.
- **nullable** - If true, this list will support empty (null) selections by clicking or otherwise re-selecting the only selected item.
- **value** - Used to set a default value of the list. If it's a *string*, the item with the same value will be selected. If it's an integer, the item with the corresponding index will be selected. It can also be an mixed array of strings and integers in which case multiple items will be selected. This requires the `multiple` option to be true.
- **standalone** - If true, this list will be a focusable, standalone control. This is *true* by default, and false when the list is used as a part of a Select or a Combo control.
- **renderers** - A hash of functions used to render items differently. See the ListItem section. Here is an example renderer:  
		
		$('<div></div>').amp('list', {
			items: [{ value: 1, label: "One", renderer: 'custom' }],
			renderers: {
				custom: function(item){
					// `this` is bound to the list amp object
					// `item` is the rendered item
					this.options.renderers[item.renderer] === arguments.callee;
				}
			}
		})
		
- **filter** - A function that decides which items will be rendered. The function is passed a single argument `(item)`. If it returns **false**, that item won't be rendered. The filter function receives the item as the only argument and `this` is bound to the list amp object.
- **renderer** - The default renderer (optional). The renderer is called for each item in the same maner as per-item renderers. If omitted the item's label will be shown as plain text.

#### Methods

`val([newVal, silent, multi])`  
Gets/Sets the list selection. If a Number is passed, the item with the said index will be selected, if a String is passed, the item with the said value will be selected. If *silent* is **true** a *change* event will not fire.  
If the list was initialized with the *multiple* option, then you can also pass an array of mixed values/indexes to the `val()` method to select multiple items at once. If the *multi* argument is *true*, then the passed selection will be *added* to the existing one, instead of replacing it.

`findByLabel(part [, startswith])`  
Returns the index of the first item whose label contains *part*. If *startswith* is true, the item's label has to begin with *part*.

`findByValue(value)`  
Returns the index of the first item whose value is *value*.

*`focusItem(index)`  
Focuses to the item with said index.

`scrollToItem(index)`  
Scrolls to item with said index.

`reset(items [,silent])`  
Resets the list's items with a new collection. This method triggers a **reset** event. If *silent* is **true**, the event is not fired.

`render()`  
Renders the list.

`toString()`  
Returns a JSON representation of the selected items' values: For instance: `["MK", "UK", "US"]` or in case of a single select: `"MK"`.

`reset(items, silent)`  
Resets the list's items with a new set. The *items* argument can be one of the following:  

- A plain array containing `{ value: "X", label: "X" }` objects.
- A jQuery SELECT element. The value/label pairs will be extracted from the OPTION elements inside it.
- A string representing an URL. The list will use ajax to fetch a JSON from the URL and update itself.

The list will always attempt to restore it's previous selection if the selected item's value can be found in the new item set. If the value is not restored, a **change** event will be fired.
It will also emit the **reset** event after resetting unless the *silent* argument is `true`.

#### Events

- **change** - Fires when the list's selection has been changed.
- **reset** - Fires when the list's items have been reset. The callback gets passed 2 arguments `(oldItems, newItems)`.


## Select
A combination of a toggleable button and List, the *select* control replaces the standard HTML dropdown element. It has all the functionality of a standard select element, plus it can be styled and modified as you like.
You can access all of the List control's options through the *list* property. The select control is just a proxy for the list.

#### Properties

- **element** - A reference to the button that toggles the dropdown list.
- **list** - A reference to the List widget that is shown when the button is clicked. This is an actual List control.

#### Options

Same options as List, except:

- **standalone** - This is always false and can't be used.
- **multiple** - This is always false and can't be used.
- **placeholder** - By default, this is the html inside the button element, but can be overwritten here.

#### Methods

In addition to the List methods, the Select control has the following:

`show()`  
Shows (opens) the list

`hide()`  
Hides (closes) the list

#### Events

Same events as List


## Combo / Autocomplete

A combination of a Text Input + List, the Combo control is used for filtering through huge lists. Combo works just like the select - you can't input just anything in the text field - it needs to be a valid item from the list.

#### Properties

- **element** - A reference to the input that toggles the select list. This is an actual Text input control.
- **list** - A reference to the List widget that is shown when the button is clicked. This is an actual List control.

#### Options

Same options as List, except:

- **standalone** - This is always false and can't be used.
- **multiple** - This is always false and can't be used.
- **minchars** - The minimum number of characters you need to type in for the autocomplete to appear. Default is 2.
- **ajax** - If passed, the list of items will be dynamically fetched from the server. The ajax option must be an object with the following properties:
    - **url**  - The ajax URL. It must return a list of items as JSON.
    - **data** - (optional) A function that must return an object with data to be passed to the server. The search term itself will be appended to the object as the `q` property.
    - **cache** - (optional, true). If set to *false*, the ajax requests won't be cached by the browser.
- **filter** - A function that is passed a list item. If it returns false, that item won't be rendered. If it returns true the item will be rendered only if the term in the text input is contained within the item's label. If it returns -1 the item will be rendered always.
- **anyValue** - Normally, the combo can only take a value of a list item it contains. If *anyValue* is set to true, however, the list items' *value* properties will be ignored, and the value of the Combo will be the actual text contained in the input. This will make it behave more like a traditional autocomplete control. **Not implemented.**


#### Methods

In addition to the List methods, the Combo control has the following:

**show()**  
Shows (opens) the list

**hide()**  
Hides (closes) the list

#### Events

Same events as List


## Tag Lists

Tag lists are just fancier multiple-select lists. They will show a regular Amp Select or Combo along with a box below it. The selected items will disappear from the Select/Combo and appear as tags below it. You can click on the tags to deselct items.

#### Properties

- **element** - The element (normally a HTML &lt;div&gt; element) representing the list.
- **input** - The Select or Combo button/input.

Unlike the select/combo controls which are buttons/inputs that have a property named "list", the tag list is the **list** itself and has a property **input** that references the select/combo. This allows us to specify whether we want to use a dropdown or a combo control for the tag list.

#### Options

Same options als List, except:

- **standalone** - This is always false and can't be used.
- **multiple** - This is always true and can't be used.
- **picker** - This can be either 'select' or 'combo'. The apropriate type of input wil be used.

#### Events

Same events as List


## Modal
Modal windows are always useful. Amp has a Modal control that will turn a DIV element into a modal window with evens. Example code:

    <div id="modal">
      <button type="button" id="modalbtn1">Ok</button>
      <button type="button" id="modalbtn2">Cancel</button>
    </div>
	…
	$('#modal').amp('modal', {});
	$('#modalbtn1').amp('button', {});
	$('#modalbtn2').amp('button', {});

When a modal is opened Amp switches the tabbing order. All controls that have the same context will be immediately available for tabbing, while controls not in the modal will be removed from the tabbing order.

#### Methods

`show()`  
Shows the modal. Show can be passed an arbitrary number of arguments (see events).

`hide()`  
Hides the modal. Hide can be passed an arbitrary number of arguments (see events). Hide can also be toggled by hitting the escape key or clicking anywhere on the overlay.

`position()`  
Repositions the modal in the center of the screen. Useful for situations where the modal dimensions depend on the content.

`captureTab(focusOnFirst)` 
Sets the tabbing order to cycle only through Amp elements within the modal. `captureTab()` is automatically called on `show()`. If you add, remove enable or disable Amp controls from the modal window while it's open, you should call `captureTab()` again to reset the tabbing order. If **focusOnFirst** is true, the first element will be focused.

#### Events

- **beforeshow** - Fires before the modal is shown. The callback receives any arguments passed to `show()`. If the callback returns **false**, the modal is not shown.
- **beforehide** - Fires before the modal is closed. The callback receives any arguments passed to `hide()`. If the callback returns **false**, the modal is not closed.
- **show** - Fires after the modal is shown.
- **hide** - Fires after the modal is closed.


## Grid

The grid control transforms a block element into a grid that will display the data from a Backbone collection. It works a bit differently than other Amp objects and it does not share the general methods, events and options. This is because the grid depends on a Backbone collection which provides most of the functionality.
    
    var collection = Backbone.Collection.extend({
      grid: {
        pagination: {
          pageSize: 3,
          dataSize: 9,
          pageAttr: 'p',
          sizeAttr: 's'
        },
        sorting: {
          initialCol: 'date',
          initialDir: 'asc',
          colAttr:    'sort',
          dirAttr:    'dir'
        },
        columns: [{
          id: 'name',
          type: 'text',
          name: 'First Name',
          editable: true,
          sortable: true
        },{
          id: 'birthday',
          type: 'date',
          name: 'Birthday',
          editable: true,
          sortable: true
        }]
      },
      initialize: function(){
        var grid = $('#grid-div').amp('grid', { datasource: this });
      }
    })();
 
#### Methods

- `render()` - Renders the grid. If it's already rendered, it re-renders it.
- `setPagination()` - Sets different pagination options. Pass `null` to disable pagination.
- `setSorting()` - Sets different sorting options. Pass `null` to disable sorting.
- `setParams()` - Sets extra params to be passed with pagination/sorting requests. Pass `null` to clear.
- `hide()` - Hides the grid. Might be useful.
- `show()` - Shows the grid.

#### Paging and Sorting Options

The paging and sorting options work by changing the Backbone collection's `url` attribute and calling the `fetch()` method. This in turn will use ajax to fill the collection again, and emit a `reset` event which you should listen to. On a `reset` event you will usually want to call `grid.render()` to refresh the grid.

The Backbone collection never keeps the entire datasetm but rather what's displayed on the current grid page, so the grid will always render the entire collection. When pages are switched, the collection is emptied and filled in with a new set of data items.

#### Pagination:

- `pageSize` - *integer*; The number of results per page.
- `dataSize` - *integer*; The number of total results.
- `pageAttr` - *string*; Name of the querystring key that denotes the page number you're fetching.
- `sizeAttr` - *string*; Name of the querystring key that denotes the number of results want (pageSize).
- `links` - *number*; The maximum number of pagination links to show. Defaults to 7.
- `method` - *string*; Name of the collection's method that will handle page switching. This method will receive 2 arguments: `page` and `query`. The first will be the page number we want to fetch and the second a query with additional parameters (for maintaining the sort order, for example). It should make sure that some kind of event is triggered (i.e. `reset`) which you can use to re-render the grid.

#### Sorting:

- `initialCol` - *string*; The id of the column the grid will be initially sorted by.
- `initialDir` - *integer*; The initial sorting direction.
- `colAttr` - *string*; Name of the querystring key that denotes the column you're sorting by.
- `dirAttr` - *string*; Name of the querystring key that denotes the sorting direction.
- `method` - *string*; Name of the collection's method that will handle sorting. This method will receive 3 arguments: `column`, `direction` and `query`. The first 2 are the property name and direction, and the third is a query with additional parameters (set by setParams). Note that paging is not conserved on a sort-order change since it doesn't really make sense. The method should make sure that some kind of event is triggered (i.e. `reset`) which you can use to re-render the grid.

### Column Options

- `id` - *string*; The id of the column. If it has the same name as a model property - the property value will be rendered in the grid.
- `type` - *string*; The data type of the column. Must be one of the following: `text`, `number`, `date`, `boolean`, `enum` or `composite`. This property dictates the control that is going to be used when editing a cell. The text, number and date types will show the corresponding input controls; booleans will show checkboxes and enums will show dropdown lists. The composite type can't be made editable.
- `name` - *string*; The title of the column header.
- `format` - *mixed*; Follows the same rules for Amp input controls. Only makes sense for `number` and `date` types.
- `editable` - *mixed*; If it's true - the column will be editable. If it's a function, it will be passed the row model and the cell will be editable if the function returns true.
- `sortable` - *boolean*; If true, the column will be sortable by clicking on the header.
- `tdAttrs` - *mixed*; You can pass a dict or a function returning a dict here. The dict will be inserted as &lt;td&gt; element attributes.
- `thAttrs` - *dict*; The dict will be inserted as &lt;th&gt; element attributes in the column header. Since the table uses `table-layout:fixed`, this is useful for controlling the width of a column.
- `content` - *function*; Normally used with `type:composite`, the function will be passed the row model and the result will be rendered in each cell instead of the default property value. It will override the defaut content of other types as well.
- `alsoChange` - *array*; A list of ids of other columns. When a `change` event is triggered on the row model forcing a redraw of a cell, a redraws will be fired on the same model for these cells as well.
- `fallback` - *mixed*; If a property's value is falsy, this value (cast to string) will be shown instead.

# Utilities


### Amp.Group (alias: Amp.AmpProxy)

When you want to perform an operation to multiple Amp controls at once, you can wrap them with an AmpProxy

		Amp.Group(control1, control2, control3).on('click', function(){
			console.log("You clicked control: " + this.element.attr('id'));
		});

You also obtain an AmpProxy object when you call amp() on a jQuery selector that returns multiple elements:

		$('.amp').amp() // Returns a proxy with all Amp objects on the page

If some of the matched elements do not have an amp object associated, you will get a special Amp.noop object (see below).


# Extensions to native types

The date extensions are taken from the excellent Date.js library and the jQuery UI datepicker (the formatting and parsing). I think they are pretty self-explanatory. If you don't like extending the native types, you can remove them from ajs/amp-extensions.js. The datepicker module, however, relies on Date.parseDate and Date.formatDate.

#### Date

- **`clone(date)`**
- **`compareTo(date)`**
- **`equals(date)`**
- **`between(date1, date2)`**
- **`addMilliseconds(number)`**
- **`addSeconds(number)`**
- **`addMinutes(number)`**
- **`addHours(number)`**
- **`addDays(number)`**
- **`addWeeks(number)`**
- **`addMonths(number)`**
- **`addYears(number)`**
- **`clearTime()`**
- **`isLeapYear()`**
- **`getDaysInMonth()`**
- **`getDayOfYear()`**
- **`isDST()`**
- **`getTimezone()`**
- **`setTimezoneOffset()`**
- **`setTimezone()`**
- **`getUTCOffset()`**
- **`Date.parseDate(format, date)`**
- **`Date.formatDate(format, date)`**

#### Number

- **`format(decimalPlaces, defaultStringValueIfZero)`** - also works with 0 decimal places
- **`round(decimalPlaces)`** - also works with 0 decimal places

# Modules and Dependencies

You don't need to use every Amp feature. You can compile and minify your own Amp version. A hard dependency for every module is Underscore.js and jQuery

- `amp-extensions.js`, extensions to native types
- `amp-core.js`, core amp functionality, useless in its own, depends on `amp-extensions.js`
- `amp-button.js`, buttons, depends on `amp-core.js`
- `amp-input.js`, inputs, depends on `amp-core.js`
- `amp-datepicker.js`, datepicker input, depends on `amp-input.js`
- `amp-lists.js`, multiple select plain list, depends on `amp-core.js`
- `amp-select.js`, select, combo and tag lists, `amp-lists.js`, `amp-button.js`, `amp-input.js`
- `amp-modal.js`, modal, depends on `amp-core.js`
- `amp-tooltip.js`, tooltip extension, depends on `amp-core.js`
- `amp-grid.js`, grid module, depends on `backbone.js`, `amp-input.js`


# Development

Amp uses the [Bauer](http://github.com/QuipuGmbh/bauer) build tool for development, but you can also just load the scripts in order in your browser. Take a look at the "builds" property of package.json to see the order in which the files need to be imported/concatenated for everything to work nicely.


# License

Amp is [MIT](http://opensource.org/licenses/MIT) licensed

/**
 * Amp Framework - Extensions Module.
 * 
 * This module contains extensions to the Array, Number and Date native types.
 * These extensions can be helpful, and are required for some Amp modules.
 * Used code from Backbone.js, Jquery-UI and Date.js.
 *
 * Amp uses the Bauer.js build system. 
 * The first statement in the file should be a string in the form "REQUIRE name version"
 * where name is the name of a javascript module visible by Bauer and version is its version.
 *
 * Quipu GmbH (http://www.quipugmbh.com)
**/

"REQUIRE underscore = 1.4.4";

(function(){
  var fn;

  /**
   * Number Extensions
  **/
  var reg1k    = /(\d+)(\d{3})/;
  var regcomma = /,/g;
  function nformat(value, round, parser){
    if( typeof value === 'string' ) {
      value = parser(value.replace(regcomma, '').replace(/^0[^.]'/, ''), 10);
    }
    if( value instanceof Date ) {
      value = +value;
    }
    if(isNaN( value )) {
      value = "";
    }
    else {
      if(!isNaN(round)) {
        value = value.toFixed(round);
      }
      var parts = ( value + "" ).split( "." );
      if( parser === parseInt || !parts[1] || !parts[1].length ) {
        parts[1] = "";
      }
      else {
        parts[1] = '.' + parts[1];
      }
      while ( reg1k.test( parts[0] ) ){
        parts[0] = parts[0].replace( reg1k, '$1,$2' );
      }
      value = parts[0] + parts[1];
    }
    return value;
  }
  
  fn = Number.prototype;
  fn.format = function(round, ifZero) {
    if(+this === 0 && typeof ifZero === 'string'){
      return ifZero;
    }
    if(this % 1 || round){
      return nformat(this, round || 2, parseFloat);
    }
    return nformat(this, null, parseInt);
  }

  fn.round = function(precision){
    var pow = Math.pow(10, precision || 2);
    return Math.round(this * pow) / pow;
  }

  /**
   * Array extensions
   * Taken from underscore.js
  **/
  fn = Array.prototype;
  fn.forEach || (fn.forEach = function(fn, context) { _.forEach(this, fn, context); return this; });  
  fn.map     || (fn.map     = function(fn, context) { return _.map(this, fn, context); });
  fn.filter  || (fn.filter  = function(fn, context) { return _.filter(this, fn, context); });
  fn.indexOf || (fn.indexOf = function(el, isSorted) { return _.indexOf(this, el, isSorted); });

  /**
   * Date Extensions
   * Code copied from Date.js and jQueryUI datepicker
  **/
  Date._defaults = {
    shortYearCutoff: '+10', // Short year values < this are in the current century, > this are in the previous century, string value starting with '+' for current year + value
    dayNamesShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNames:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames:      ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
  	monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }

  /* Standard date formats. */
  Date.COOKIE       = 'D, dd M yy';
  Date.RFC_850      = 'DD, dd-M-y';
  Date.RFC_1036     = 'D, d M y';
  Date.RFC_1123     = 'D, d M yy';
  Date.RFC_2822     = 'D, d M yy';
  Date.TICKS        = '!';
  Date.TIMESTAMP    = '@';
  Date.RSS          = Date.RFC_822  = 'D, d M y';
  Date.W3C          = Date.ISO_8601 = Date.ATOM = Date.RFC_3339 = 'yy-mm-dd';
  
  /** 
   * Determines if the current date instance is within a LeapYear.
   * @param {Number}   The year (0-9999).
   * @return {Boolean} true if date is within a LeapYear, otherwise false.
   */
  Date.isLeapYear = Date.isLeapYear || function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
  };
  /**
   * Gets the number of days in the month, given a year and month value. Automatically corrects for LeapYear.
   * @param {Number}   The year (0-9999).
   * @param {Number}   The month (0-11).
   * @return {Number}  The number of days in the month.
   */
  Date.getDaysInMonth = Date.getDaysInMonth || function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };
  
  fn = Date.prototype;
  
  /**
   * Returns a new Date object that is an exact date and time copy of the original instance.
   * @return {Date}    A new Date instance
   */
  fn.clone || (fn.clone = function () {
    return new Date(this.getTime()); 
  });

  /**
   * Compares this instance to a Date object and return an number indication of their relative values.  
   * @param {Date}     Date object to compare [Required]
   * @return {Number}  1 = this is greaterthan date. -1 = this is lessthan date. 0 = values are equal
   */
  fn.compareTo || (fn.compareTo = function (date) {
    if (isNaN(this)) { 
      throw new Error(this); 
    }
    if (date instanceof Date && !isNaN(date)) {
      return (this > date) ? 1 : (this < date) ? -1 : 0;
    } else { 
      throw new TypeError(date); 
    }
  });

  /**
   * Compares this instance to another Date object and returns true if they are equal.  
   * @param {Date}     Date object to compare [Required]
   * @return {Boolean} true if dates are equal. false if they are not equal.
   */
  fn.equals || (fn.equals = function (date) { 
    return (this.compareTo(date) === 0); 
  });

  /**
   * Determines is this instance is between a range of two dates or equal to either the start or end dates.
   * @param {Date}     Start of range [Required]
   * @param {Date}     End of range [Required]
   * @return {Boolean} true is this is between or equal to the start and end dates, else false
   */
  fn.between || (fn.between = function (start, end) {
    var t = this.getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  /**
   * Adds the specified number of milliseconds to this instance. 
   * @param {Number}   The number of milliseconds to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addMilliseconds || (fn.addMilliseconds = function (value) {
    this.setMilliseconds(this.getMilliseconds() + value);
    return this;
  });

  /**
   * Adds the specified number of seconds to this instance. 
   * @param {Number}   The number of seconds to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addSeconds || (fn.addSeconds = function (value) { 
    return this.addMilliseconds(value * 1000); 
  });

  /**
   * Adds the specified number of seconds to this instance. 
   * @param {Number}   The number of seconds to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addMinutes || (fn.addMinutes = function (value) { 
    return this.addMilliseconds(value * 60000); /* 60*1000 */
  });

  /**
   * Adds the specified number of hours to this instance. 
   * @param {Number}   The number of hours to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addHours || (fn.addHours = function (value) { 
    return this.addMilliseconds(value * 3600000); /* 60*60*1000 */
  });

  /**
   * Adds the specified number of days to this instance. 
   * @param {Number}   The number of days to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addDays || (fn.addDays = function (value) { 
    return this.addMilliseconds(value * 86400000); /* 60*60*24*1000 */
  });

  /**
   * Adds the specified number of weeks to this instance. 
   * @param {Number}   The number of weeks to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addWeeks || (fn.addWeeks = function (value) { 
    return this.addMilliseconds(value * 604800000); /* 60*60*24*7*1000 */
  });

  /**
   * Adds the specified number of months to this instance. 
   * @param {Number}   The number of months to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addMonths || (fn.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
  });

  /**
   * Adds the specified number of years to this instance. 
   * @param {Number}   The number of years to add. The number can be positive or negative [Required]
   * @return {Date}    this
   */
  fn.addYears || (fn.addYears = function (value) {
    return this.addMonths(value * 12);
  });

  /**
   * Resets the time of this Date object to 12:00 AM (00:00), which is the start of the day.
   * @return {Date}    this
   */
  fn.clearTime || (fn.clearTime = function () {
    this.setHours(0); 
    this.setMinutes(0); 
    this.setSeconds(0);
    this.setMilliseconds(0); 
    return this;
  });

  /**
   * Determines whether or not this instance is in a leap year.
   * @return {Boolean} true if this instance is in a leap year, else false
   */
  fn.isLeapYear || (fn.isLeapYear = function () { 
    var y = this.getFullYear(); 
    return (((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0)); 
  });

  /**
   * Get the number of days in the current month, adjusted for leap year.
   * @return {Number}  The number of days in the month
   */
  fn.getDaysInMonth || (fn.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
  });

  /**
   * Get the numeric day number of the year, adjusted for leap year.
   * @return {Number} 0 through 364 (365 in leap years)
   */
  fn.getDayOfYear || (fn.getDayOfYear = function () {
    return Math.floor((this - new Date(this.getFullYear(), 0, 1)) / 86400000);
  });

  /**
   * Determine whether Daylight Saving Time (DST) is in effect
   * @return {Boolean} True if DST is in effect.
   */
  fn.isDST || (fn.isDST = function () {
    return this.toString().match(/(E|C|M|P)(S|D)T/)[2] == "D";
  });

  /**
   * Get the timezone abbreviation of the current date.
   * @return {String} The abbreviated timezone name (e.g. "EST")
   */
  fn.getTimezone || (fn.getTimezone = function () {
    return Date.getTimezoneAbbreviation(this.getUTCOffset, this.isDST());
  });

  fn.setTimezoneOffset || (fn.setTimezoneOffset = function (s) {
    var here = this.getTimezoneOffset(), there = Number(s) * -6 / 10;
    this.addMinutes(there - here); 
    return this;
  });

  fn.setTimezone || (fn.setTimezone = function (s) { 
    return this.setTimezoneOffset(Date.getTimezoneOffset(s)); 
  });

  /**
   * Get the offset from UTC of the current date.
   * @return {String} The 4-character offset string prefixed with + or - (e.g. "-0500")
   */
  fn.getUTCOffset || (fn.getUTCOffset = function () {
    var n = this.getTimezoneOffset() * -10 / 6, r;
    if (n < 0) { 
      r = (n - 10000).toString(); 
      return r[0] + r.substr(2); 
    } else { 
      r = (n + 10000).toString();  
      return "+" + r.substr(1); 
    }
  });
  
  /* 
   * Date.parseDate is taken from jQuery-ui datepicker's date parser.
   * It replaces the native Date.parse method since it's implementation dependent.
   * 
   * Parse a string value into a date object.
   * See formatDate below for the possible formats.
   *
   * @param  format    string - the expected format of the date
   * @param  value     string - the date in the above format
   * @param  settings  Object - attributes include:
   *                   shortYearCutoff  number - the cutoff year for determining the century (optional)
   *                   dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
   *                   dayNames         string[7] - names of the days from Sunday (optional)
   *                   monthNamesShort  string[12] - abbreviated names of the months (optional)
   *                   monthNames       string[12] - names of the months (optional)
   * @return  Date - the extracted date value or null if value is blank 
   */
  Date.parseDate || (Date.parseDate = function (format, value, settings) {
  	if (format == null || value == null) {
  		throw 'Date.parseDate: Invalid arguments';
  	}
  	if ((value = (typeof value == 'object' ? value.toString() : value + '')) == '') {
  		return null;
  	}
  	var shortYearCutoff = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff;
  	    shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
  	var dayNamesShort   = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
  	var dayNames        = (settings ? settings.dayNames : null) || this._defaults.dayNames;
  	var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
  	var monthNames      = (settings ? settings.monthNames : null) || this._defaults.monthNames;
  	var year            = -1;
  	var month           = -1;
  	var day             = -1;
  	var doy             = -1;
  	var literal         = false;

  	// Check whether a format character is doubled
  	function lookAhead(match) {
  		var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
  		if (matches) {
  			iFormat++;
  		}
  		return matches;
  	};
		
  	// Extract a number from the string value
  	function getNumber(match) {
  		var isDoubled = lookAhead(match);
  		var size      = (match == '@' ? 14 : (match == '!' ? 20 : (match == 'y' && isDoubled ? 4 : (match == 'o' ? 3 : 2))));
  		var digits    = new RegExp('^\\d{1,' + size + '}');
  		var num       = value.substring(iValue).match(digits);
  		if (!num) {
  			throw 'Date.parseDate: Missing number at position ' + iValue;
  		}
  		iValue += num[0].length;
  		return parseInt(num[0], 10);
  	};
		
  	// Extract a name from the string value and convert to an index
  	function getName(match, shortNames, longNames) {
  		var index = -1, names = (lookAhead(match) ? longNames : shortNames).map(function (v, k) {
  			return [k, v];
  		}).sort(function (a, b) {
  			return -(a[1].length - b[1].length);
  		}).forEach(function (pair, i) {
  			var name = pair[1];
  			if (value.substr(iValue, name.length).toLowerCase() == name.toLowerCase()) {
  				index = pair[0];
  				iValue += name.length;
  				return false;
  			}
  		});
  		if (index != -1) {
  			return index + 1;
  		}
  		else {
  			throw 'Date.parseDate: Unknown name at position ' + iValue;
  		}
  	};
		
  	// Confirm that a literal character matches the string value
  	var checkLiteral = function() {
  		if (value.charAt(iValue) != format.charAt(iFormat)) {
  			throw 'Date.parseDate: Unexpected literal at position ' + iValue;
  		}
  		iValue++;
  	};

  	var iValue = 0;
  	for (var iFormat = 0; iFormat < format.length; iFormat++) {
  		if (literal) {
  			if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
  				literal = false;
  			}
  			else {
  				checkLiteral();
  			}
  		}
  		else {
  			switch (format.charAt(iFormat)) {
  				case 'd':
  					day = getNumber('d');
  					break;
  				case 'D':
  					getName('D', dayNamesShort, dayNames);
  					break;
  				case 'o':
  					doy = getNumber('o');
  					break;
  				case 'm':
  					month = getNumber('m');
  					break;
  				case 'M':
  					month = getName('M', monthNamesShort, monthNames);
  					break;
  				case 'y':
  					year = getNumber('y');
  					break;
  				case '@':
  					var date = new Date(getNumber('@'));
  					year = date.getFullYear();
  					month = date.getMonth() + 1;
  					day = date.getDate();
  					break;
  				case '!':
  					var date = new Date((getNumber('!') - this._ticksTo1970) / 10000);
  					year = date.getFullYear();
  					month = date.getMonth() + 1;
  					day = date.getDate();
  					break;
  				case "'":
  					if (lookAhead("'"))
  						checkLiteral();
  					else
  						literal = true;
  					break;
  				default:
  					checkLiteral();
  			}
  		}
  	}
  	if (iValue < value.length){
  		var extra = value.substr(iValue);
  		if (!(/^\s+/).test(extra)) {
  			throw "Date.parseDate: Extra/unparsed characters found in date: " + extra;
  		}
  	}
  	if (year == -1) {
  		year = new Date().getFullYear();
  	}
  	else if (year < 100) {
  		year += new Date().getFullYear() - new Date().getFullYear() % 100 + (year <= shortYearCutoff ? 0 : -100);
  	}
  	if (doy > -1) {
  		month = 1;
  		day = doy;
  		do {
  			var dim = this._getDaysInMonth(year, month - 1);
  			if (day <= dim) {
  				break;
  			}
  			month++;
  			day -= dim;
  		} while (true);
  	}

  	var date = new Date(year, month - 1, day);
  	// daylightSavingTime fix
  	date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
  	if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
  		throw 'Invalid date'; // E.g. 31/02/00
  	}
  	return date;
  });
	
  /* 
   * Format a date object into a string value.
   * The format can be combinations of the following:
   * d  - day of month (no leading zero)
   * dd - day of month (two digit)
   * o  - day of year (no leading zeros)
   * oo - day of year (three digit)
   * D  - day name short
   * DD - day name long
   * m  - month of year (no leading zero)
   * mm - month of year (two digit)
   * M  - month name short
   * MM - month name long
   * y  - year (two digit)
   * yy - year (four digit)
   * @ - Unix timestamp (ms since 01/01/1970)
   * ! - Windows ticks (100ns since 01/01/0001)
   * '...' - literal text
   * '' - single quote
   *
   * @param  format    string - the desired format of the date
   * @param  date      Date - the date value to format
   * @param  settings  Object - attributes include:
   *                   dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
   *                   dayNames         string[7] - names of the days from Sunday (optional)
   *                   monthNamesShort  string[12] - abbreviated names of the months (optional)
   *                   monthNames       string[12] - names of the months (optional)
   * @return  string - the date in the above format 
   */
  Date.formatDate || (Date.formatDate = function(format, date, settings) {
    if(!date) {
    	return '';
    }
  	var dayNamesShort   = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
  	var dayNames        = (settings ? settings.dayNames : null) || this._defaults.dayNames;
  	var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
  	var monthNames      = (settings ? settings.monthNames : null) || this._defaults.monthNames;

  	// Check whether a format character is doubled
  	var lookAhead = function(match) {
  		var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
  		if (matches) {
  			iFormat++;
  		}
  		return matches;
  	};

  	// Format a number, with leading zero if necessary
  	var formatNumber = function(match, value, len) {
  		var num = '' + value;
  		if (lookAhead(match)) {
  			while (num.length < len) {
  				num = '0' + num;
  			}
  		}
  		return num;
  	};
		
  	// Format a name, short or long as requested
  	var formatName = function(match, value, shortNames, longNames) {
  		return (lookAhead(match) ? longNames[value] : shortNames[value]);
  	};

  	var output = '';
  	var literal = false;

  	if (date) {
  		for (var iFormat = 0; iFormat < format.length; iFormat++) {
  			if (literal) {
  				if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
  					literal = false;
  				}
  				else {
  					output += format.charAt(iFormat);
  				}
  			}
  			else {
  				switch (format.charAt(iFormat)) {
  					case 'd':
  						output += formatNumber('d', date.getDate(), 2);
  						break;
  					case 'D':
  						output += formatName('D', date.getDay(), dayNamesShort, dayNames);
  						break;
  					case 'o':
  						output += formatNumber('o', Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
  						break;
  					case 'm':
  						output += formatNumber('m', date.getMonth() + 1, 2);
  						break;
  					case 'M':
  						output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
  						break;
  					case 'y':
  						output += (lookAhead('y') ? date.getFullYear() :
  							(date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
  						break;
  					case '@':
  						output += date.getTime();
  						break;
  					case '!':
  						output += date.getTime() * 10000 + (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) + Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000);
  						break;
  					case "'":
  						if (lookAhead("'"))
  							output += "'";
  						else
  							literal = true;
  						break;
  					default:
  						output += format.charAt(iFormat);
  				}
  			}
  		}
  	}
  	return output;
  });

})();

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
        var results = this.amps.map(function(amp){ 
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
    if( !_.isArray(amps) ) amps = Array.prototype.slice.call(arguments);

    // Fix missing `new` keyword
    if( this === Amp || this === window ) {
      return new Amp.AmpProxy(amps);
    }
    this.amps = amps;
    this.pointer = 0;
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

/**
 * Amp List Widget.
 *
 * Used as a standalone list and 
 * a part of the Select and Combo controls.
**/

;(function($, Amp){
    
  /**
   * List control constructor.
   * The list control is used by Select and Combo, but can also be a standalone list.
   * In the standalone version it looks and behaves mostly like the HTML multiple Select element.
  **/
  function List(element, options){
    var value, list;
 
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
/* ====================================
 * Amp framework v1.0.0
 * Quipu GmbH (http://www.quipugmbh.com)
 *
 * Amp Modal.
 * ==================================== */

;(function($, Amp) {
  var slice = Array.prototype.slice;
  var backdrop = null;
  var curmodal = null;
  
  function Modal(element, options){
    // The base control that we'll extend
    var modal = Amp.createObject(Modal.proto, Amp.controls.control(element, options || {}, true));
    element.addClass('amp-modal');
    return modal;
  }

  Modal.proto = Amp.createObject(Amp.controls.control.proto, {
    /**
     * Captures the tabbing order to cycle through Amp elements within this modal. 
    **/
    captureTab: function(focusOnFirst){
      this.__unbinder && this.__unbinder();
      
      // All amp elements within this modal that are focusable
      var amps = $('.amp:not([tabindex=-1])', this.element);
      if(amps.length){
        focusOnFirst && setTimeout(function(){ amps.first().focus(); }, 0);
        function handler(e){
          if(e.which === Amp.keys.TAB && !e.shiftKey){
            e.preventDefault();
            amps.first().focus();
          }
        }
        amps.last().keydown(handler);
        this.__unbinder = function(){
          amps.last().unbind('keydown', handler);
          this.__unbinder = null;
        }
      }
      return this;
    },
    
    show: function() {
      if(this.trigger.apply(this, ['beforeshow'].concat(slice.call(arguments)))) {
        $('body').append(backdrop || (backdrop = $('<div class="modal-backdrop"></div>')));
        this.element.addClass('shown');
        this.captureTab(true).trigger('show');
        this.position();
        curmodal = this;
      }
      return this;
    },
    
    hide: function() {
      this.__unbinder && this.__unbinder();
      if(this.trigger.apply(this, ['beforehide'].concat(slice.call(arguments)))) {
        backdrop && backdrop.detach();
        this.element.removeClass('shown');
        this.trigger('hide');
        curmodal = null;
      }
      return this;
    },
    
    position: function(){
      this.element.css({ 'margin-left': this.element.width() / -2 });
      return this;
    }
  });


  $(function(){
    $(document.body)
    .keydown(function(e){
      if(e.which === Amp.keys.ESCAPE && curmodal) {
        curmodal && curmodal.hide();
        return false;
      }
    })
    .delegate('.modal-backdrop', 'click', function(){
      curmodal && curmodal.hide();
    });
  });

  Amp.controls.modal = Modal;
  Amp.registerMethods(['captureTab']);
})(window.jQuery, window.Amp);

/* ====================================
 * Amp framework v1.0.0
 * Quipu GmbH (http://www.quipugmbh.com)
 *
 * Amp tooltip mixin. 
 * Extends the control proto.
 * ==================================== */
;(function($, Amp) {
  var defaultOffset    = 0;
  var defaultTitle     = "I'm a tooltip!";
  var defaultPlacement = "right";
  
  function Tooltip(amp) {
    this.amp = amp;
    this.element = amp.element;
    this.node = amp.element[0];
  }

  Tooltip.prototype = {
    show: function() {
      var pos, actualWidth, actualHeight, placement, tip, tp;

      tip = this.tip();
      tip.css({ top: 0, left: 0, display: 'block' }).detach().insertAfter(this.element);

      pos = $.extend({}, this.element.position(), {
        width:  this.element.outerWidth(true),
        height: this.element.outerHeight(true)
      });

      actualWidth  = tip[0].offsetWidth;
      actualHeight = tip[0].offsetHeight;
      placement    = typeof this.placement === 'function' ? this.placement.call(this.amp) : this.placement;

      switch (placement) {
        case 'below':
          tp = {top: pos.top + pos.height + this.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
          break;
        case 'above':
          tp = {top: pos.top - actualHeight - this.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
          break;
        case 'left':
          tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.offset};
          break;
        case 'right':
          tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.offset};
          break;
      }
      tip.css(tp).removeClass('right left above below').addClass(placement).removeClass('hidden');
    },

    hide: function() {
      this.tip().addClass('hidden');
    },

    tip: function() {
      this.__tip   = this.__tip || $('<div class="amp-tooltip hidden"><div class="amp-tooltip-arrow"></div><div class="amp-tooltip-inner"></div></div>');
      this.__inner = this.__inner || $('.amp-tooltip-inner', this.__tip);
      this.__inner.html(this.title || "No title set");
      return this.__tip;
    }
  }
  
  Amp.controls.control.proto.showTip = function(title, placement, offset) {
    this.__tooltip || (this.__tooltip = new Tooltip(this));

    this.__tooltip.offset = offset !== undefined ? offset : defaultOffset;
    this.__tooltip.placement = placement || defaultPlacement;
    this.__tooltip.title = title || defaultTitle;

    this.__tooltip.show();
    return this;
  }
  
  Amp.controls.control.proto.hideTip = function(){
    this.__tooltip && this.__tooltip.hide();
    return this;
  }
  
  Amp.controls.control.proto.showTooltip = Amp.controls.control.proto.showTip;
  Amp.controls.control.proto.hideTooltip = Amp.controls.control.proto.hideTip;

  Amp.tooltipSettings = function(settings){
    'placement' in settings && (defaultPlacement = settings.placement);
    'offset' in settings && (defaultOffset = settings.offset);
    'title' in settings && (defaultTitle = settings.title);
  }
  
  Amp.registerMethods(['showTip', 'hideTip', 'showTooltip', 'hideTooltip']);
})(window.jQuery, window.Amp);

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
          $('td[data-prop="' + prop + '"]', row).html( grid._formatCell(item, prop) );
          if(grid._columns[prop].alsoChange) {
            _.map(grid._columns[prop].alsoChange, function(also){
              if(also !== prop && (also in grid._columns)) {
                $('td[data-prop="' + also + '"]', row).html( grid._formatCell(item, also) );
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
        html += _.map(self._columnsOrder, function(id){
          var info  = self._columns[id];
          var ed    = _.isFunction(info.editable) ? info.editable(item) : info.editable;
          var attrs = makeAttrs({ 'data-prop': info.id, 'class': (info.type || 'text') + (ed ? " editable" : "") });
          return "<td " + attrs + ">" + self._formatCell(item, info.id) + "</td>";
        }).join("");
        html += "</tr>";
      }
      this.body.html(html);
      this._makeFooter();
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
      var i, max, html, active, footer;

      if(!this._pagination) {
        return;
      }

      if((footer = $('tr.footer', this.body)).length === 0) {
        footer = $("<tr class='footer'></tr>").appendTo(this.body);
      }

      html = "<td class='paginator' colspan='" + this._columnsOrder.length + "'>";
      html += "Page <input data-grid='" +  this.guid + "' value='" + this._currentPage + "'> of <b>" + this._totalPages + "</b> &nbsp; ";
      
      i = Math.min(Math.max(1, this._currentPage - Math.floor(this._pageLinks / 2)), this._totalPages - this._pageLinks + 1);
      max = i + this._pageLinks;
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
      var info  = this._columns[prop];
      var value = _.isFunction(info.content) ? info.content(item) : item.get(prop);

      switch(info.type) {
        case 'number': 
          value = (typeof value === 'number') ? value.format(info.format || 0) : ('falsy' in info ? info.falsy : "");
          break;
        case 'date': 
          value = Date.formatDate(info.format, value); 
          break;
        case 'boolean':
          value = value ? 'True' : 'False';
          break;
        case 'enum':
          value = value;
          break;
        default: 
          value = (typeof value === 'undefined') ? ('falsy' in info ? info.falsy : '') : value; 
          break;
      }

      return value;
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

      input.setFormat(column.format);
      input.val(item.get(field), true);

      _.isFunction(column.editStart) && column.editStart.call(this.src, item, input);

      input.element.css({ 
        height: h - (input.element.outerWidth() - input.element.width()), 
        width:  w - (input.element.outerHeight() - input.element.height()), 
        top:    p.top, 
        left:   p.left 
      })
      .addClass('shown')
      .appendTo( parent );

      input.__grid = this;
      input.__prop = field;
      input === inputs.date && input.show();

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
      var v, n, sel; 
      
      if( !this._editedItem ) {
        return;
      }

      v = this._editedItem.get(field);
      n = input.val();

      if("" + v !== "" + n) {
        this._editedItem.set(field, n);
      }
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
      var c, i = -1, cols = this._columnsOrder;
      
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
        i = this.src.indexOf(row) + direction[1];
        i = i >= this.src.length ? 0 : i < 0 ? this.src.length - 1 : i;
        row = this.src.at(i);
      }

      return { cid: row.cid, field: field };
    }
  }
  
  /**
   * Grid module initialization and delegated event handlers
  **/
  $(function(){
    inputs.text   = $("<input class='amp-grid-input'>").amp('text', { validators: {} });
    inputs.number = $("<input class='amp-grid-input'>").amp('number', { validators: {}, format: 0 });
    inputs.date   = $("<input class='amp-grid-input'>").amp('date', { validators: {}, format: 'yy-mm-dd' });
    
    // We would normally just pass direction to the trigger method
    // but there appears to be a bug in jQuery 2.0 that prevents
    // the extra arguments to reach the blur handler. 
    var direction = false;
    
    _.each(inputs, function(input, type){
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
    .delegate('table.amp-grid td.editable', {
      click: function(){
        if(this.style.cursor === 'pointer') {
          var self = $(this), id = self.parent().attr('id').split('-');
          cache[ id[1] ]._editStart( id[2], self.data('prop') ).element.focus().select();
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
    .delegate('table tr.footer input', 'keydown', function(e){
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


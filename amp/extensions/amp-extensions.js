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

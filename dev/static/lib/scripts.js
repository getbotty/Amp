//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

//     Backbone.js 1.0.0

//     (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.0.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    _.extend(this, _.pick(options, modelOptions));
    if (options.parse) attrs = this.parse(attrs, options) || {};
    if (defaults = _.result(this, 'defaults')) {
      attrs = _.defaults({}, attrs, defaults);
    }
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // A list of options to be attached directly to the model, if provided.
  var modelOptions = ['url', 'urlRoot', 'collection'];

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
      if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

      options = _.extend({validate: true}, options);

      // Do not persist invalid models.
      if (!this._validate(attrs, options)) return false;

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.url) this.url = options.url;
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, merge: false, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.defaults(options || {}, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults(options || {}, setOptions);
      if (options.parse) models = this.parse(models, options);
      if (!_.isArray(models)) models = models ? [models] : [];
      var i, l, model, attrs, existing, sort;
      var at = options.at;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        if (!(model = this._prepareModel(models[i], options))) continue;

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(model)) {
          if (options.remove) modelMap[existing.cid] = true;
          if (options.merge) {
            existing.set(model.attributes, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }

        // This is a new model, push it to the `toAdd` list.
        } else if (options.add) {
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
      }

      // Remove nonexistent models if appropriate.
      if (options.remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          splice.apply(this.models, [at, 0].concat(toAdd));
        } else {
          push.apply(this.models, toAdd);
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      if (options.silent) return this;

      // Trigger `add` events.
      for (i = 0, l = toAdd.length; i < l; i++) {
        (model = toAdd[i]).trigger('add', model, this, options);
      }

      // Trigger `sort` if the collection was sorted.
      if (sort) this.trigger('sort', this, options);
      return this;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: this.length}, options));
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function(begin, end) {
      return this.models.slice(begin, end);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id != null ? obj.id : obj.cid || obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Figure out the smallest index at which a model should be inserted so as
    // to maintain order.
    sortedIndex: function(model, value, context) {
      value || (value = this.comparator);
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _.sortedIndex(this.models, model, iterator, context);
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options || (options = {});
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model._validate(attrs, options)) {
        this.trigger('invalid', this, attrs, options);
        return false;
      }
      return model;
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
    'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(e.g. model, collection, id, className)* are
    // attached directly to the view.  See `viewOptions` for an exhaustive
    // list.
    _configure: function(options) {
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, viewOptions));
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && window.ActiveXObject &&
          !(window.external && window.external.msActiveXFilteringEnabled)) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional){
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      fragment = this.getFragment(fragment || '');
      if (this.fragment === fragment) return;
      this.fragment = fragment;
      var url = this.root + fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function (model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

}).call(this);
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
    element.attr('autocomplete', 'off');
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
        if(_.isFunction(validator)){
          validator = [validator];
        }
        else if(_.isArray(validator)){
          validator = validator.slice();
        }
        else if(_.isObject(validator)){
          values = _.values(validator);
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
      var range = this.options.range[0] === "+" ? [year, year + rnum] : this.options.range[0] === "-" ? [year + rnum, year] : [year - rnum, year + rnum];
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
      this.trigger('show');

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
      this.trigger('hide');
      
      return this;
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
  var backdropClass = ''; 
  var backdropShown = false;
  var slice = Array.prototype.slice;
  var backdrop = $('<div class="amp-modal-backdrop"></div>');
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
        $(document.body).append(backdrop);
        backdropShown = true;
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
        backdropShown = false;
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
    $(document.body).keydown(function(e){
      if(e.which === Amp.keys.ESCAPE && curmodal) {
        curmodal && curmodal.hide();
        return false;
      }
    });
    backdrop.click(function(){
      curmodal && curmodal.hide();
    });
  });

  Amp.controls.modal = Modal;
  Amp.registerMethods(['captureTab']);
  
  Amp.showBackdrop = function(klass){
    if(!backdropShown) {
      backdropShown = true;
      klass && backdrop.addClass(backdropClass = klass);
      $(document.body).prepend(backdrop);
    }
  }
  Amp.hideBackdrop = function(){
    if(backdropShown) {
      backdrop.removeClass(backdropClass).detach();
      backdropClass = '';
      backdropShown = false;
    }
  }
  
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
            : value;
          break;
        case 'date':
          value = Date.formatDate(info.format, value); 
          break;
        case 'boolean':
          value = value ? 'True' : 'False';
          break;         
        case 'enum':
          value = _.isFunction(info.items) ? info.items(item) : info.items ? _.find(info.items, function(e){ return e.value === value; }) : value;
          value = !value && 'falsy' in info ? info.falsy : _.isFunction(info.content) ? info.content(item) : value.label;           
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

      var input  = inputs[column.widget] ? inputs[column.widget] : inputs[column.type];
      if(!input) {
        return;
      }
            
      // Offset parent returns document. We need body.
      if(parent[0].tagName === 'HTML') {
        parent = $(document.body);
      }
      
      if((input === inputs.enum) || (input === inputs.combo)) {
        input.reset(_.isFunction(column.items) ? column.items(item) : column.items , true, true);
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
    inputs.combo  = $("<input class='amp-grid-input'>").amp('combo',{ items: [] });
    
    // We would normally just pass direction to the trigger method
    // but there appears to be a bug in jQuery 2.0 that prevents
    // the extra arguments to reach the blur handler. 
    var direction = false;

    _.each(inputs, function(input, type){

      if(type === 'enum' || type ==='combo') {             
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
                fe = (type ==='enum') ? input.focusElement() : input.list.focusElement()
                if(fe  && fe.is(':first-child')) {
                  direction = [0, -1];
                  $(this).trigger('blur');
                  return false;
                }
              }
              else if(e.which === Amp.keys.DOWN) {
                fe = (type ==='enum') ? input.focusElement() : input.list.focusElement()
                if(fe && fe.is(':last-child')) {
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


/*!
 * Trend 0.2.0
 *
 * Fail-safe TransitionEnd event for jQuery.
 *
 * Adds a new "trend" event that can be used in browsers that don't
 * support "transitionend".
 *
 * NOTE: Only supports being bound with "jQuery.one".
 *
 * Copyright 2014, Pixel Union - http://pixelunion.net
 * Released under the MIT license
 */
;(function($){

  // Prefixed transitionend event names
  var transitionEndEvents =
    "webkitTransitionEnd " +
    "otransitionend " +
    "oTransitionEnd " +
    "msTransitionEnd " +
    "transitionend";

  // Prefixed transition duration property names
  var transitionDurationProperties = [
    "transition-duration",
    "-moz-transition-duration",
    "-webkit-transition-duration",
    "-ms-transition-duration",
    "-o-transition-duration",
    "-khtml-transition-duration"
  ];

  // Prefixed transition delay property names
  var transitionDelayProperties = [
    "transition-delay",
    "-moz-transition-delay",
    "-webkit-transition-delay",
    "-ms-transition-delay",
    "-o-transition-delay",
    "-khtml-transition-delay"
  ];

  // Parses a CSS time value into milliseconds.
  var parseTime = function(s) {
    s = s.replace(/\s/, "");
    var v = window.parseFloat(s);

    return s.match(/[^m]s$/i)
      ? v * 1000
      : v;
  };

  // Parses the longest time unit found in a series of CSS properties.
  // Returns a value in milliseconds.
  var parseProperties = function(el, properties) {
    var duration = 0;

    for (var i = 0; i < properties.length; i++) {
      // Get raw CSS value
      var value = el.css(properties[i]);
      if (!value) continue;

      // Multiple transitions--pick the longest
      if (value.indexOf(",") !== -1) {
        var values = value.split(",");
        var durations = (function(){
          var results = [];
          for (var i = 0; i < values.length; i++) {
            var duration = parseTime(values[i]);
            results.push(duration);
          }
          return results;
        })();

        duration = Math.max.apply(Math, durations);
      }

      // Single transition
      else {
        duration = parseTime(value);
      }

      // Accept first vaue
      break;
    }

    return duration;
  };

  $.event.special.trend = {
    // Triggers an event handler when an element is done transitioning.
    //
    // Handles browsers that don't support transitionend by adding a
    // timeout with the transition duration.
    add: function(handleObj) {
      var el = $(this);
      var fired = false;

      // Mark element as being in transition
      el.data("trend", true);

      // Calculate a fallback duration. + 20 because some browsers fire
      // timeouts faster than transitionend.
      var time =
        parseProperties(el, transitionDurationProperties) +
        parseProperties(el, transitionDelayProperties) +
        20;

      var cb = function(e) {
        // transitionend events can be sent for each property. Let's just
        // skip all but the first. Also handles the timeout callback.
        if (fired) return;

        // Child elements that also have transitions can be fired before we
        // complete. This will catch and ignore those. Unfortunately, we'll
        // have to rely on the timeout in these cases.
        if (e && e.srcElement !== el[0]) return;

        // Mark element has not being in transition
        el.data("trend", false);

        // Callback
        fired = true;
        if (handleObj.handler) handleObj.handler();
      };

      el.one(transitionEndEvents, cb);
      el.data("trend-timeout", window.setTimeout(cb, time));
    },

    remove: function(handleObj) {
      var el = $(this);
      el.off(transitionEndEvents);
      window.clearTimeout(el.data("trend-timeout"));
    }
  };

})(jQuery);

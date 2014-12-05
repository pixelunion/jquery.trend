# jquery.trend

Fail-safe TransitionEnd event for jQuery.

Adds a new `trend` event that can be used in browsers that don't support
`transitionend`.

It works by parsing an element's `transitionDuration` property and using
`setTimeout` as a fallback. Because of this, Trend can only be used with
`jQuery.one`.

## Usage

```css
.some-element {
  opacity: 0;
  transition: opacity 200ms;
}

.some-element.active {
  opacity: 1;
}
```

```js
var el = $(".some-element");

el.addClass("active");

el.one("trend", function(e){
  // Called approx 200ms later
});
```

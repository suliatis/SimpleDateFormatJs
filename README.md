# SimpleDateFormatJs

## Overview

There are many JavaScript libraries out there to deal with date formating, but none of them has identical behavior with Java's [`SimpleDateFormat`](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html). It's a problem when you would like to use the same date formating patterns between your JavaScript frontend and Java backend. My main goal with this project is implement `SimpleDateFormat`'s functionality in JavaScript, as far as possible also have fun and learn a lot.  

## Supported patterns

The list of supported patterns is not complete yet. 

- G: Era designator
- y: Year	Year
- Y: Week year
- M: Month in year (context sensitive)
- L: Month in year (standalone form)
- w: Week in year
- W: Week in month
- D: Day in year
- d: Day in month
- F: Day of week in month
- E: Day name in week
- u: Day number of week (1 = Monday, ..., 7 = Sunday)
- a: Am/pm marker
- H: Hour in day
- k: Hour in day (1-24)
- K: Hour in am/pm (0-11)
- h: Hour in am/pm (1-12)
- m: Minute in hour
- s: Second in minute
- S: Millisecond
- Z: Time zone (RFC 822)
- X: Time zone (ISO 8601)

To read more about the patterns, please visit the offical documentation of [`SimpleDateFormat`](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html).

## Examples

If no pattern defined in constructor it uses ISO date pattern. **Warning**: it is not identical the original behavior and it is just a temporary solution.

```javascript
new SimpleDateFormat().format(new Date(2017, 4, 18)); //it prints 2017-05-18
```

You can apply a new pattern on existing date formatters.

```javascript
var formatter = new SimpleDateFormat();
formatter.applyPattern("MM/dd/yy");
formatter.format(new Date(2017, 4, 18)); //it prints 05/18/17
```

It supports both native `Date` and `moment.js`.

```javascript
new SimpleDateFormat("MM/dd/yy").format(new Date(2017, 4, 13)); //it prints: 05/13/17
new SimpleDateFormat("MM/dd/yy").format(moment([2017, 4, 13])); //same output
```

For more examples check out the tests in [`spec`](./spec) folder.


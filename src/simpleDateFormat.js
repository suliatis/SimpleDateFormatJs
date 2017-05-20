var moment = require('moment');

var SimpleDateFormat = function(pattern) {
  if (pattern) this.pattern = pattern;
  else this.pattern = "y-MM-dd";
  this.regex = /('.*')|(G+|y+|Y+|M+|L+|w+|W+|D+|d+|F+|E+|u+|a+|H+|k+|K+|h+|m+|s+|S+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
  
  this.TYPES = {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    YEAR: "YEAR",
    MONTH: "MONTH"
  };
};

SimpleDateFormat.prototype.applyPattern = function(pattern) {
  if (!pattern) throw "Pattern must be defined!";
  this.pattern = pattern;
}

SimpleDateFormat.prototype.format = function(date) {
  var formattedString = "";
  var d = moment(date);
  var p = this.pattern;
  var matches;
  while((matches = this.regex.exec(p))) {
    var quotedString = matches[1];
    var subPattern = matches[2];
    var nonPatternLetters = matches[3];
    var otherCharacters = matches[4];

    if (quotedString) {
			formattedString += quotedString.substring(1, quotedString.length - 1).replace("''", "'");
		} else if (nonPatternLetters) {
      // swallow non pattern letters
    } else if (otherCharacters) {
      formattedString += otherCharacters;
    } else if (subPattern) {
      formattedString += this._formatField(this._fieldWithType(d, subPattern[0], subPattern.length));
    }

    p = p.substr(matches.index + matches[0].length);
  } 
  return formattedString;
}

SimpleDateFormat.prototype.weekInMonth = function(d) {
  var first = moment(d).startOf("month").week();
  var current = d.week();
  if (first > current) first = first - moment(d).startOf("month").weeksInYear();
  return current - first + 1;
}

SimpleDateFormat.prototype.dayOfWeekInMonth = function(d) {
  var c = 1;
  var m = moment(d);
  while ((m = moment(m).date(m.date() - 7)).month() === d.month()) c++;
  return c;
}

SimpleDateFormat.prototype.dayNameInWeek = function(d) {
  return moment.weekdays()[d.weekday()];
}

SimpleDateFormat.prototype.shortDayNameInWeek = function(d) {
  return moment.weekdaysShort()[d.weekday()];
}

SimpleDateFormat.prototype._fieldWithType = function(d, letter, length) {
  switch (letter) {
    case "G":
      return this._asText("AD");
    case "y":
      return this._asYear(d.year(), length);
    case "Y":
      return this._asYear(d.weekYear(), length);
    case "M":
      return this._asMonth(d.month(), length);
    case "L":
      return this._asMonth(d.month(), length);
    case "w":
      return this._asNumber(d.week(), length);
    case "W": 
      return this._asNumber(this.weekInMonth(d), length);
    case "D":
      return this._asNumber(d.dayOfYear(), length);
    case "d":
      return this._asNumber(d.date(), length);
    case "F":
      return this._asNumber(this.dayOfWeekInMonth(d), length);
    case "E":
      if (length <= 3) return this._asText(this.shortDayNameInWeek(d));
      else return this._asText(this.dayNameInWeek(d));
    case "u":
      return this._asNumber(d.isoWeekday(), length);
    case "a":
      return this._asText(moment.localeData().meridiem(d.hours(), d.minutes()));
    case "H":
      return this._asNumber(d.hours(), length);
    case "k":
      return this._asNumber(d.hours() || 24, length);
    case "K":
      return this._asNumber(d.hours() % 12, length);
    case "h":
      return this._asNumber((d.hours() % 12) || 12, length);
    case "m":
      return this._asNumber(d.minutes(), length);
    case "s":
      return this._asNumber(d.seconds(), length);
    case "S":
      return this._asNumber(d.milliseconds(), length);
  }
  throw "Unexpected pattern letter: " + letter;
}

SimpleDateFormat.prototype._asText = function(v) {
  return { value: v, type: this.TYPES.TEXT };
}

SimpleDateFormat.prototype._asNumber = function(v, l) {
  return { value: v, length: l, type: this.TYPES.NUMBER };
}

SimpleDateFormat.prototype._asMonth = function(v, l) {
  return { value: v, length: l, type: this.TYPES.MONTH };
}

SimpleDateFormat.prototype._asYear = function(v, l) {
  return { value: v, length: l, type: this.TYPES.YEAR };
}

SimpleDateFormat.prototype._formatField = function(field) {
  switch (field.type) {
    case this.TYPES.YEAR:
      if (field.length === 2) return ("" + field.value).substr(2);
      else return this._padWithZeroes("" + field.value, field.length);
    case this.TYPES.MONTH:
      if (field.length <= 2) return this._padWithZeroes("" + (field.value + 1), field.length);
      else if (field.length === 3) return moment.monthsShort()[field.value];
      else return moment.months()[field.value];
    case this.TYPES.NUMBER:
      return this._padWithZeroes("" + field.value, field.length);
    case this.TYPES.TEXT: 
      return field.value;
  }
  throw "Unexpected field type: " + field.type;
}

SimpleDateFormat.prototype._padWithZeroes = function(str, length) {
  var s = str;
  while(s.length < length) s = "0" + s;
  return s;
}

module.exports.SimpleDateFormat = SimpleDateFormat;

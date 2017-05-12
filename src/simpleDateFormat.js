var moment = require('moment');

var SimpleDateFormat = function(pattern) {
  this.pattern = pattern;
  this.regex = /('[^']*')|(G+|y+|Y+|M+|L+|w+|W+|D+|d+|F+|E+|u+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
  
  this.TYPES = {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    YEAR: "YEAR",
    MONTH: "MONTH"
  };
};

SimpleDateFormat.prototype.format = function(date) {
  var d = moment(date);
  var p = this.pattern;
  var matches;
  while((matches = this.regex.exec(p))) {
    var subPattern = matches[2];

    if (subPattern) {
      return this._format(this._getRawFormatData(d, subPattern[0], subPattern.length));
    }

    p = p.substr(matches.index + matches[0].length);
  } 
  return "";
}

moment.prototype.weekInMonth = function() {
  var first = moment(this).startOf("month").week();
  var current = this.week();
  if (first > current) first = first - moment(this).startOf("month").weeksInYear();
  return current - first + 1;
}

moment.prototype.dayOfWeekInMonth = function() {
  var c = 1;
  var m = moment(this);
  while ((m = moment(m).date(m.date() - 7)).month() === this.month()) c++;
  return c;
}

moment.prototype.dayNameInWeek = function() {
  return moment.weekdays()[this.weekday()];
}

moment.prototype.shortDayNameInWeek = function() {
  return moment.weekdaysShort()[this.weekday()];
}

SimpleDateFormat.prototype._getRawFormatData = function(d, letter, length) {
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
      return this._asNumber(d.weekInMonth(), length);
    case "D":
      return this._asNumber(d.dayOfYear(), length);
    case "d":
      return this._asNumber(d.date(), length);
    case "F":
      return this._asNumber(d.dayOfWeekInMonth(), length);
    case "E":
      if (length <= 3) return this._asText(d.shortDayNameInWeek());
      else return this._asText(d.dayNameInWeek());
    case "u":
      return this._asNumber(d.isoWeekday(), length);
  }
  return "";
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

SimpleDateFormat.prototype._getWeekdayName = function(d, length) {
  if (length <= 3) return moment.weekdaysShort()[d.weekday()];
  else return moment.weekdays()[d.weekday()];
}

SimpleDateFormat.prototype._format = function(rawData) {
  switch (rawData.type) {
    case this.TYPES.YEAR:
      if (rawData.length === 2) return ("" + rawData.value).substr(2);
      else return this._padWithZeroes("" + rawData.value, rawData.length);
    case this.TYPES.MONTH:
      if (rawData.length <= 2) return this._padWithZeroes("" + (rawData.value + 1), rawData.length);
      else if (rawData.length === 3) return moment.monthsShort()[rawData.value];
      else return moment.months()[rawData.value];
    case this.TYPES.NUMBER:
      return this._padWithZeroes("" + rawData.value, rawData.length);
    case this.TYPES.TEXT: 
      return rawData.value;
  }
  return "";
}

SimpleDateFormat.prototype._padWithZeroes = function(str, length) {
  var s = str;
  while(s.length < length) s = "0" + s;
  return s;
}

module.exports.SimpleDateFormat = SimpleDateFormat;

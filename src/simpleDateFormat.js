var moment = require('moment');

var SimpleDateFormat = function(pattern) {
  if (pattern) this.pattern = pattern;
  
  this.regex = /('.*')|(G+|y+|Y+|M+|L+|w+|W+|D+|d+|F+|E+|u+|a+|H+|k+|K+|h+|m+|s+|S+|Z+|X+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
  
  this.TYPES = {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    YEAR: "YEAR",
    MONTH: "MONTH",
    RFCTZ: "RFCTZ",
    ISOTZ: "ISOTZ"
  };
}

SimpleDateFormat.prototype.applyPattern = function(pattern) {
  if (!pattern) throw "Pattern must be defined!";
  this.pattern = pattern;
}

SimpleDateFormat.prototype.format = function(date) {
  var formattedString = "";
  var d = moment(date);

  var p;
  if (this.pattern) p = this.pattern;
  else p = this._defaultPatternsByLocale[d.locale()];

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
    case "Z":
      return this._asRfcTz(d.utcOffset());
    case "X":
      return this._asIsoTz(d.utcOffset(), length);
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

SimpleDateFormat.prototype._asRfcTz = function(v) {
  return { value: v, type: this.TYPES.RFCTZ }
}

SimpleDateFormat.prototype._asIsoTz = function(v, l) {
  return { value: v, length: l, type: this.TYPES.ISOTZ }
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
    case this.TYPES.RFCTZ:
      var sign = "+";
      if (field.value < 0) sign = "-";
      var hours = this._padWithZeroes("" + Math.abs(Math.floor(field.value / 60)), 2);
      var minutes = this._padWithZeroes("" + Math.abs(field.value % 60), 2);
      return sign + hours + minutes;
    case this.TYPES.ISOTZ:
       var sign = "+";
      if (field.value < 0) sign = "-";
      var hours = this._padWithZeroes("" + Math.abs(Math.floor(field.value / 60)), 2);
      var minutes = this._padWithZeroes("" + Math.abs(field.value % 60), 2);
      if (field.length === 1) return sign + hours;
      else if (field.length === 2) return sign + hours + minutes;
      else return sign + hours + ":" + minutes;
  }
  throw "Unexpected field type: " + field.type;
}

SimpleDateFormat.prototype._padWithZeroes = function(str, length) {
  var s = str;
  while(s.length < length) s = "0" + s;
  return s;
}

SimpleDateFormat.prototype._defaultPatternsByLocale = {
  "":"M/d/yy h:mm a",
  "ar_AE":"dd/MM/yy hh:mm a",
  "ar_JO":"dd/MM/yy hh:mm a",
  "ar_SY":"dd/MM/yy hh:mm a",
  "hr_HR":"dd.MM.yy. HH:mm",
  "fr_BE":"d/MM/yy H:mm",
  "es_PA":"MM/dd/yy hh:mm a",
  "mt_MT":"dd/MM/yyyy HH:mm",
  "es_VE":"dd/MM/yy hh:mm a",
  "bg":"dd.MM.yy HH:mm",
  "zh_TW":"yyyy/M/d a h:mm",
  "it":"dd/MM/yy H.mm",
  "ko":"yy. M. d a h:mm",
  "uk":"dd.MM.yy H:mm",
  "lv":"yy.d.M HH:mm",
  "da_DK":"dd-MM-yy HH:mm",
  "es_PR":"MM-dd-yy hh:mm a",
  "vi_VN":"HH:mm dd/MM/yyyy",
  "en_US":"M/d/yy h:mm a",
  "sr_ME":"d.M.yy. HH.mm",
  "sv_SE":"yyyy-MM-dd HH:mm",
  "es_BO":"dd-MM-yy hh:mm a",
  "en_SG":"d/M/yy h:mm a",
  "ar_BH":"dd/MM/yy hh:mm a",
  "pt":"dd-MM-yyyy H:mm",
  "ar_SA":"dd/MM/yy hh:mm a",
  "sk":"d.M.yyyy H:mm",
  "ar_YE":"dd/MM/yy hh:mm a",
  "hi_IN":"d/M/yy h:mm a",
  "ga":"yy/MM/dd HH:mm",
  "en_MT":"dd/MM/yyyy HH:mm",
  "fi_FI":"d.M.yyyy H:mm",
  "et":"d.MM.yy H:mm",
  "sv":"yyyy-MM-dd HH:mm",
  "cs":"d.M.yy H:mm",
  "sr_BA_#Latn":"d.M.yy. HH.mm",
  "el":"d/M/yyyy h:mm a",
  "uk_UA":"dd.MM.yy H:mm",
  "hu":"yyyy.MM.dd. H:mm",
  "fr_CH":"dd.MM.yy HH:mm",
  "in":"yy/MM/dd HH:mm",
  "es_AR":"dd/MM/yy HH:mm",
  "ar_EG":"dd/MM/yy hh:mm a",
  "ja_JP_JP_#u-ca-japanese":"Gy.MM.dd H:mm",
  "es_SV":"MM-dd-yy hh:mm a",
  "pt_BR":"dd/MM/yy HH:mm",
  "be":"d.M.yy H.mm",
  "is_IS":"d.M.yyyy HH:mm",
  "cs_CZ":"d.M.yy H:mm",
  "es":"d/MM/yy H:mm",
  "pl_PL":"dd.MM.yy HH:mm",
  "tr":"dd.MM.yyyy HH:mm",
  "ca_ES":"dd/MM/yy HH:mm",
  "sr_CS":"d.M.yy. HH.mm",
  "ms_MY":"dd/MM/yyyy h:mm",
  "hr":"yyyy.MM.dd HH:mm",
  "lt":"yy.M.d HH.mm",
  "es_ES":"d/MM/yy H:mm",
  "es_CO":"d/MM/yy hh:mm a",
  "bg_BG":"dd.MM.yy HH:mm",
  "sq":"yy-MM-dd h.mm.a",
  "fr":"dd/MM/yy HH:mm",
  "ja":"yy/MM/dd H:mm",
  "sr_BA":"yy-MM-dd HH:mm",
  "is":"d.M.yyyy HH:mm",
  "es_PY":"dd/MM/yy hh:mm a",
  "de":"dd.MM.yy HH:mm",
  "es_EC":"dd/MM/yy H:mm",
  "es_US":"M/d/yy h:mm a",
  "ar_SD":"dd/MM/yy hh:mm a",
  "en":"M/d/yy h:mm a",
  "ro_RO":"dd.MM.yyyy HH:mm",
  "en_PH":"M/d/yy h:mm a",
  "ca":"dd/MM/yy HH:mm",
  "ar_TN":"dd/MM/yy hh:mm a",
  "sr_ME_#Latn":"d.M.yy. HH.mm",
  "es_GT":"d/MM/yy hh:mm a",
  "sl":"d.M.y H:mm",
  "ko_KR":"yy. M. d a h:mm",
  "el_CY":"dd/MM/yyyy h:mm a",
  "es_MX":"d/MM/yy hh:mm a",
  "ru_RU":"dd.MM.yy H:mm",
  "es_HN":"MM-dd-yy hh:mm a",
  "zh_HK":"yy'年'M'月'd'日' ah:mm",
  "no_NO_NY":"dd.MM.yy HH:mm",
  "hu_HU":"yyyy.MM.dd. H:mm",
  "th_TH":"d/M/yyyy, H:mm' น.'",
  "ar_IQ":"dd/MM/yy hh:mm a",
  "es_CL":"dd-MM-yy H:mm",
  "fi":"d.M.yyyy H:mm",
  "ar_MA":"dd/MM/yy hh:mm a",
  "ga_IE":"dd/MM/yyyy HH:mm",
  "mk":"d.M.yy HH:mm",
  "tr_TR":"dd.MM.yyyy HH:mm",
  "et_EE":"d.MM.yy H:mm",
  "ar_QA":"dd/MM/yy hh:mm a",
  "sr__#Latn":"d.M.yy. HH.mm",
  "pt_PT":"dd-MM-yyyy H:mm",
  "fr_LU":"dd/MM/yy HH:mm",
  "ar_OM":"dd/MM/yy hh:mm a",
  "th":"d/M/yyyy, H:mm' น.'",
  "sq_AL":"yy-MM-dd h.mm.a",
  "es_DO":"dd/MM/yy hh:mm a",
  "es_CU":"d/MM/yy H:mm",
  "ar":"dd/MM/yy hh:mm a",
  "ru":"dd.MM.yy H:mm",
  "en_NZ":"d/MM/yy h:mm a",
  "sr_RS":"d.M.yy. HH.mm",
  "de_CH":"dd.MM.yy HH:mm",
  "es_UY":"dd/MM/yy hh:mm a",
  "ms":"yy/MM/dd HH:mm",
  "el_GR":"d/M/yyyy h:mm a",
  "iw_IL":"HH:mm dd/MM/yy",
  "en_ZA":"yyyy/MM/dd h:mm a",
  "th_TH_TH_#u-nu-thai":"d/M/yyyy, H:mm' น.'",
  "hi":"M/d/yy h:mm a",
  "fr_FR":"dd/MM/yy HH:mm",
  "de_AT":"dd.MM.yy HH:mm",
  "nl":"d-M-yy H:mm",
  "no_NO":"dd.MM.yy HH:mm",
  "en_AU":"d/MM/yy h:mm a",
  "vi":"HH:mm dd/MM/yyyy",
  "nl_NL":"d-M-yy H:mm",
  "fr_CA":"yy-MM-dd HH:mm",
  "lv_LV":"yy.d.M HH:mm",
  "de_LU":"dd.MM.yy HH:mm",
  "es_CR":"dd/MM/yy hh:mm a",
  "ar_KW":"dd/MM/yy hh:mm a",
  "sr":"d.M.yy. HH.mm",
  "ar_LY":"dd/MM/yy hh:mm a",
  "mt":"dd/MM/yyyy HH:mm",
  "it_CH":"dd.MM.yy HH:mm",
  "da":"dd-MM-yy HH:mm",
  "de_DE":"dd.MM.yy HH:mm",
  "ar_DZ":"dd/MM/yy hh:mm a",
  "sk_SK":"d.M.yyyy H:mm",
  "lt_LT":"yy.M.d HH.mm",
  "it_IT":"dd/MM/yy H.mm",
  "en_IE":"dd/MM/yy HH:mm",
  "zh_SG":"dd/MM/yy a hh:mm",
  "ro":"dd.MM.yyyy HH:mm",
  "en_CA":"dd/MM/yy h:mm a",
  "nl_BE":"d/MM/yy H:mm",
  "no":"dd.MM.yy HH:mm",
  "pl":"yy-MM-dd HH:mm",
  "zh_CN":"yy-M-d ah:mm",
  "ja_JP":"yy/MM/dd H:mm",
  "de_GR":"dd.MM.yy HH:mm",
  "sr_RS_#Latn":"d.M.yy. HH.mm",
  "iw":"HH:mm dd/MM/yy",
  "en_IN":"d/M/yy h:mm a",
  "ar_LB":"dd/MM/yy hh:mm a",
  "es_NI":"MM-dd-yy hh:mm a",
  "zh":"yy-M-d ah:mm",
  "mk_MK":"d.M.yy HH:mm",
  "be_BY":"d.M.yy H.mm",
  "sl_SI":"d.M.y H:mm",
  "es_PE":"dd/MM/yy hh:mm a",
  "in_ID":"dd/MM/yy H:mm",
  "en_GB":"dd/MM/yy HH:mm",
}

module.exports.SimpleDateFormat = SimpleDateFormat;

var sdf = require("../src/simpleDateFormat.js");
var moment = require("moment");

describe("simple date format with default pattern", function() {
  it("formats with ISO pattern", function() {
    /*
     * It's not identical with Java's `SimpleDateFormat` behavior because it's
     * uses the default format defined in locale. Currently I'm not sure how to
     * solve this problem.
     */
    expect(new sdf.SimpleDateFormat().format(moment([1999, 11, 1]))).toBe("1999-12-01");
  });

  it("applies the given pattern to this date format", function() {
    var formatter = new sdf.SimpleDateFormat();
    var d = moment([1999, 11, 1]);
    expect(formatter.format(d)).toBe("1999-12-01");
    formatter.applyPattern("MM/dd/yy");
    expect(formatter.format(d)).toBe("12/01/99");
  });
});

describe("simple date format with default locale", function () {
  /* 
   * All the tests below assumes the SimpleDateFormat's default locale is 
   * EN_US which means every text in English and the first day of the week
   * is Sunday.
   */

	it("formats era designator", function() {
    var d = moment();
    expect(new sdf.SimpleDateFormat("G").format(d)).toBe("AD");
  });

  it("formats year", function() {
    var d = moment([1989, 11, 6]);
    expect(new sdf.SimpleDateFormat("y").format(d)).toBe("1989");
    expect(new sdf.SimpleDateFormat("yy").format(d)).toBe("89");
    expect(new sdf.SimpleDateFormat("yyy").format(d)).toBe("1989");
    expect(new sdf.SimpleDateFormat("yyyy").format(d)).toBe("1989");
  });

  it("formats week year", function() {
    /*
     * A week year is in sync with a WEEK_OF_YEAR cycle. All weeks between the 
     * first and last weeks (inclusive) have the same week year value. 
     * Therefore, the first and last days of a week year may have different 
     * calendar year values.
     *
     * For example, January 1, 1998 is a Thursday. If getFirstDayOfWeek() is 
     * MONDAY and getMinimalDaysInFirstWeek() is 4 (ISO 8601 standard compatible 
     * setting), then week 1 of 1998 starts on December 29, 1997, and ends on 
     * January 4, 1998. The week year is 1998 for the last three days of 
     * calendar year 1997. If, however, getFirstDayOfWeek() is SUNDAY, then week 
     * 1 of 1998 starts on January 4, 1998, and ends on January 10, 1998; the 
     * first three days of 1998 then are part of week 53 of 1997 and their week 
     * year is 1997.
     */

    var d = moment([1997, 11, 28]);
    expect(new sdf.SimpleDateFormat("Y").format(d)).toBe("1998");
    expect(new sdf.SimpleDateFormat("YY").format(d)).toBe("98");
    expect(new sdf.SimpleDateFormat("YYY").format(d)).toBe("1998");
    expect(new sdf.SimpleDateFormat("YYYY").format(d)).toBe("1998");
  });
  
  it("formats month in year (context sensitive)", function() {
    var d = moment([2017, 5, 5]);
    expect(new sdf.SimpleDateFormat("M").format(d)).toBe("6");
    expect(new sdf.SimpleDateFormat("MM").format(d)).toBe("06");
    expect(new sdf.SimpleDateFormat("MMM").format(d)).toBe("Jun");
    expect(new sdf.SimpleDateFormat("MMMM").format(d)).toBe("June");
  });

  it("formats month in year (standalone form)", function() {
    /*
     * In English there is no difference in standalon and context sensitive 
     * forms, however here is a thread that explains a the difference between
     * them:
     * http://stackoverflow.com/questions/32840336/standalone-form-of-month-name-in-java-date-format
     */

    var d = moment([2017, 5, 5]);
    expect(new sdf.SimpleDateFormat("L").format(d)).toBe("6");
    expect(new sdf.SimpleDateFormat("LL").format(d)).toBe("06");
    expect(new sdf.SimpleDateFormat("LLL").format(d)).toBe("Jun");
    expect(new sdf.SimpleDateFormat("LLLL").format(d)).toBe("June");
  });

  it("formats week in year", function() {
    var d = moment([1997, 11, 28]);
    expect(new sdf.SimpleDateFormat("w").format(d)).toBe("1");
    expect(new sdf.SimpleDateFormat("ww").format(d)).toBe("01");
  });

  it("formats week in month", function() {
    var d = moment([1997, 11, 28]);
    expect(new sdf.SimpleDateFormat("W").format(d)).toBe("5");
  });

  it("formats day in year", function() {
    var d = moment([1997, 0, 3]);
    expect(new sdf.SimpleDateFormat("D").format(d)).toBe("3");
    expect(new sdf.SimpleDateFormat("DD").format(d)).toBe("03");
    expect(new sdf.SimpleDateFormat("DDD").format(d)).toBe("003");
  });

  it("formats day in month", function() {
    var d = moment([2017, 5, 5]);
    expect(new sdf.SimpleDateFormat("d").format(d)).toBe("5");
    expect(new sdf.SimpleDateFormat("dd").format(d)).toBe("05");
  });

  it("formats the day of week in month", function() {
    //it is the second Wendesday in May
    var d = moment([2017, 4, 10]);
    expect(new sdf.SimpleDateFormat("F").format(d)).toBe("2");
  });

  it("formats the day name in week", function() {
    var d = moment([2017, 4, 10]);
    expect(new sdf.SimpleDateFormat("E").format(d)).toBe("Wed");
    expect(new sdf.SimpleDateFormat("EE").format(d)).toBe("Wed");
    expect(new sdf.SimpleDateFormat("EEE").format(d)).toBe("Wed");
    expect(new sdf.SimpleDateFormat("EEEE").format(d)).toBe("Wednesday");
  });

  it("formats the day number in week", function() {
    //first day of the week is always Monday, does not matter which locale you use
    expect(new sdf.SimpleDateFormat("u").format(moment([2017, 4, 8]))).toBe("1");
    expect(new sdf.SimpleDateFormat("u").format(moment([2017, 4, 7]))).toBe("7");
  });

  it("formats the am/pm markers", function() {
    expect(new sdf.SimpleDateFormat("a").format(moment([2017, 4, 20, 16, 30, 0, 0]))).toBe("PM");
    expect(new sdf.SimpleDateFormat("a").format(moment([2017, 4, 20, 10, 30, 0, 0]))).toBe("AM");
  });

  it("combines patterns", function() {
    var d = moment([2001, 6, 4, 12, 8, 56]);
    expect(new sdf.SimpleDateFormat("yyyy.MM.dd G 'at' HH:mm:ss z").format(d)).toBe("2001.07.04 AD at 12:08:56 PDT");
    expect(new sdf.SimpleDateFormat("EEE, MMM d, ''yy").format(d)).toBe("Wed, Jul 4, '01");
    expect(new sdf.SimpleDateFormat("h:mm a").format(d)).toBe("12:08 PM");
    expect(new sdf.SimpleDateFormat("hh 'o''clock' a, zzzz").format(d)).toBe("12 o'clock PM, Pacific Daylight Time");
    expect(new sdf.SimpleDateFormat("K:mm a, z").format(d)).toBe("0:08 PM, PDT");
    expect(new sdf.SimpleDateFormat("yyyyy.MMMMM.dd GGG hh:mm aaa").format(d)).toBe("02001.July.04 AD 12:08 PM");
    expect(new sdf.SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss Z").format(d)).toBe("Wed, 4 Jul 2001 12:08:56 -0700");
    expect(new sdf.SimpleDateFormat("yyMMddHHmmssZ").format(d)).toBe("010704120856-0700");
    expect(new sdf.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").format(d)).toBe("2001-07-04T12:08:56.235-0700");
    expect(new sdf.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(d)).toBe("2001-07-04T12:08:56.235-07:00");
    expect(new sdf.SimpleDateFormat("YYYY-'W'ww-u").format(d)).toBe("2001-W27-3");
  });
});

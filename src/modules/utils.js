exports.getTheDate = () => {
   const date = new Date();
   const dateStr = date.toLocaleDateString();
   const shortenedDateStr = dateStr.slice(`-${dateStr.length}`, -4) + dateStr.slice(-2);

   return shortenedDateStr;
};

exports.currentYear = () => {
   const date = new Date();

   return date.getFullYear();
};

exports.getRelativeTime = (date) => {
   /* ~by vsync on SO */

   const units = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: 24 * 60 * 60 * 1000 * (365 / 12),
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
   };

   const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

   const currentDate = new Date();
   const elapsed = new Date(date) - currentDate;
   
   // `for...in` to iterate over the properties of the `units` object
   for (const u in units) {

      // `Math.abs` to deal with past dates, and future dates (not really needed in this app)
      // If elapsed time is NOT more than 1000(ms), use secondsss
      if (Math.abs(elapsed) > units[u] || u === "second") {
         return rtf.format(Math.round(elapsed / units[u]), u);
      }
   }
};

// TODO Finish getAverageReadSpeed function!
exports.getAverageReadSpeed = (text) => {
   const words = text.split(" ");
   const wordCount = words.length;
   const averageHumanWordsPerMinute = 200;
   const averageSpeedInMilliseconds = (wordCount / averageHumanWordsPerMinute) * 60 * 1000;

   const units = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: 24 * 60 * 60 * 1000 * (365 / 12),
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
   };

   for (const u in units) {
      if (averageSpeedInMilliseconds >= units[u] || u === "second") {
         return `${Math.round(averageSpeedInMilliseconds / units[u])} ${u} read`;
      }
   }
};

exports.createUsernameInitials = (username) => {
   // get second character from the letter or number following any of these separators
   const regex = /-+\w|_+\w|\.+\w/gm;

   const firstCharacter = username.slice(0, 1);

   // if `username.match(regex)` returns anything, get the first match and manipulate string from there
   // if it returns a falsey value, use the second letter of `username`
   const secondCharacterMatches = username.match(regex);
   const secondCharacter = secondCharacterMatches ? secondCharacterMatches[0].slice(-1) : username.slice(1, 2);

   return (firstCharacter + secondCharacter).toUpperCase();
};

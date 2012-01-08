var hookio = require('./hook'),
    async  = require('async'),
    path   = require('path');

exports.log = function (hook, event, data, sender) {
  if (!this.silent) {
    var name  = sender.name  || 'no name specified',
        type  = sender.type  || 'no type specified',
        // Determine whether this is the log of a locally or remotely generated event
        local = hook.name ? hook.name === sender.name : false;

    data  = data  || 'null';
    event = event || 'no event specified';

    //
    // TODO: Add the ability to filter what gets logged,
    //       based on the event namepace
    //
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }

    data = data.toString();

    //
    // Remark: The current approach to rendering to the console will break on really,
    // long event names or hook names or hook types. I will take a patch to make the,
    // the CLI reporter better.
    //
    //
    //       hook.emit('super::really::long::event::long::long:on:asdasdasdasdasdasdasd');
    //       ^^ will break console table formatting
    //
    //
    var truncatedData = data,
        maxChars      = 50;

    if (!this.verbose) {
      if(truncatedData.length >= maxChars) {
        truncatedData = truncatedData.substr(0, maxChars) + ' ... ';
      }
    }

    var color = local ? 'green' : 'magenta';
    console.log(' Name: '[color].bold + pad(name, 20)[color] + ' ' + pad(event, 40).yellow + ' Type: '.cyan.bold + pad(type, 15).cyan + ' Data: '.grey.bold + truncatedData.grey);

  }
};


function pad (str, len, chr) {
  var s;

  if (!chr) {
    chr = ' ';
  }

  s = str;
  if (str.length < len) {
    for (var i = 0; i < (len - str.length); i++) {
      s += chr;
    }
  }
  return s;
}

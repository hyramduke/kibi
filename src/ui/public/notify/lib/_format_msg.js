define(function (require) {
  var _ = require('lodash');
  var has = _.has;
  var formatESMsg = require('ui/notify/lib/_format_es_msg');

  /**
   * Formats the error message from an error object, extended elasticsearch
   * object or simple string; prepends optional second parameter to the message
   * @param  {Error|String} err
   * @param  {String} from - Prefix for message indicating source (optional)
   * @returns {string}
   */
  function formatMsg(err, from) {
    var rtn = '';
    if (from) {
      rtn += from + ': ';
    }

    var esMsg = formatESMsg(err);

    if (typeof err === 'string') {
      rtn += err;
    } else if (esMsg) {
      rtn += esMsg;
    } else if (err instanceof Error) {
      rtn += formatMsg.describeError(err);
    } else if (has(err, 'status') && has(err, 'data')) {
      // is an Angular $http "error object"
      rtn += 'Error ' + err.status + ' ' + err.statusText + ': ' + err.data.message;
    } else if (has(err, 'options') && has(err, 'response')) {
      // kibi: added to handle request-promise errors
      rtn += formatMsg.describeRequestPromiseError(err);
    }

    return rtn;
  };

  formatMsg.describeRequestPromiseError = function (err) {
    let msg = `Error ${err.statusCode}: `;

    if (typeof err.response.body === 'string') {
      msg += err.response.body;
    } else if (err.response.body.message) {
      msg += err.response.body.message;
    }
    return msg;
  };

  formatMsg.describeError = function (err) {
    if (!err) return undefined;
    if (err.body && err.body.message) return err.body.message;
    if (err.message) return err.message;
    return '' + err;
  };

  return formatMsg;
});

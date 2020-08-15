"use strict";

exports.__esModule = true;
exports.default = void 0;

var _reactRedux = require("react-redux");

var _reactRouter = require("react-router");

var _AsyncConnect = _interopRequireDefault(require("../components/AsyncConnect"));

var _store = require("../store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _reactRedux.connect)(null, {
  beginGlobalLoad: _store.beginGlobalLoad,
  endGlobalLoad: _store.endGlobalLoad
})((0, _reactRouter.withRouter)(_AsyncConnect.default));

exports.default = _default;
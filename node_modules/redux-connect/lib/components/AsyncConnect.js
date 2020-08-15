"use strict";

exports.__esModule = true;
exports.default = exports.AsyncConnect = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRouter = require("react-router");

var _reactRouterConfig = require("react-router-config");

var _reactRedux = require("react-redux");

var _utils = require("../helpers/utils");

var _state = require("../helpers/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var AsyncConnect =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(AsyncConnect, _Component);

  function AsyncConnect(props) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this.state = {
      previousLocation: _this.isLoaded() ? null : props.location
    };
    _this.mounted = false;
    _this.loadDataCounter = 0;
    return _this;
  }

  var _proto = AsyncConnect.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.mounted = true;
    var dataLoaded = this.isLoaded(); // we dont need it if we already made it on server-side

    if (!dataLoaded) {
      this.loadAsyncData(this.props);
    }
  };

  _proto.UNSAFE_componentWillReceiveProps = function UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    var _this$props = this.props,
        location = _this$props.location,
        reloadOnPropsChange = _this$props.reloadOnPropsChange;
    var navigated = location !== nextProps.location; // Allow a user supplied function to determine if an async reload is necessary

    if (navigated && reloadOnPropsChange(this.props, nextProps)) {
      this.loadAsyncData(nextProps);
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.mounted = false;
  };

  _proto.isLoaded = function isLoaded() {
    var reduxConnectStore = this.props.reduxConnectStore;
    return (0, _state.getMutableState)(reduxConnectStore.getState()).reduxAsyncConnect.loaded;
  };

  _proto.loadAsyncData = function loadAsyncData(_ref) {
    var _this2 = this;

    var reduxConnectStore = _ref.reduxConnectStore,
        otherProps = _objectWithoutPropertiesLoose(_ref, ["reduxConnectStore"]);

    var _this$props2 = this.props,
        location = _this$props2.location,
        beginGlobalLoad = _this$props2.beginGlobalLoad,
        endGlobalLoad = _this$props2.endGlobalLoad;
    var loadResult = (0, _utils.loadAsyncConnect)(_extends({}, otherProps, {
      store: reduxConnectStore
    }));
    this.setState({
      previousLocation: location
    }); // TODO: think of a better solution to a problem?

    this.loadDataCounter += 1;
    beginGlobalLoad();
    return function (loadDataCounterOriginal) {
      return loadResult.then(function () {
        // We need to change propsToShow only if loadAsyncData that called this promise
        // is the last invocation of loadAsyncData method. Otherwise we can face a situation
        // when user is changing route several times and we finally show him route that has
        // loaded props last time and not the last called route
        if (_this2.loadDataCounter === loadDataCounterOriginal && _this2.mounted !== false) {
          _this2.setState({
            previousLocation: null
          });
        } // TODO: investigate race conditions
        // do we need to call this if it's not last invocation?


        endGlobalLoad();
      });
    }(this.loadDataCounter);
  };

  _proto.render = function render() {
    var _this3 = this;

    var previousLocation = this.state.previousLocation;
    var _this$props3 = this.props,
        location = _this$props3.location,
        _render = _this$props3.render;
    return _react.default.createElement(_reactRouter.Route, {
      location: previousLocation || location,
      render: function render() {
        return _render(_this3.props);
      }
    });
  };

  return AsyncConnect;
}(_react.Component);

exports.AsyncConnect = AsyncConnect;
AsyncConnect.defaultProps = {
  helpers: {},
  reloadOnPropsChange: function reloadOnPropsChange() {
    return true;
  },
  render: function render(_ref2) {
    var routes = _ref2.routes;
    return (0, _reactRouterConfig.renderRoutes)(routes);
  }
};

var AsyncConnectWithContext = function AsyncConnectWithContext(_ref3) {
  var context = _ref3.context,
      otherProps = _objectWithoutPropertiesLoose(_ref3, ["context"]);

  var Context = context || _reactRedux.ReactReduxContext;

  if (Context == null) {
    throw new Error('Please upgrade to react-redux v6');
  }

  return _react.default.createElement(Context.Consumer, null, function (_ref4) {
    var reduxConnectStore = _ref4.store;
    return _react.default.createElement(AsyncConnect, _extends({
      reduxConnectStore: reduxConnectStore
    }, otherProps));
  });
};

var _default = AsyncConnectWithContext;
exports.default = _default;
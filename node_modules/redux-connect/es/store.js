var _handleActions;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { createAction, handleActions } from 'redux-actions';
import { getMutableState, getImmutableState } from './helpers/state';
export var clearKey = createAction('@redux-conn/CLEAR');
export var beginGlobalLoad = createAction('@redux-conn/BEGIN_GLOBAL_LOAD');
export var endGlobalLoad = createAction('@redux-conn/END_GLOBAL_LOAD');
export var load = createAction('@redux-conn/LOAD', function (key) {
  return {
    key: key
  };
});
export var loadSuccess = createAction('@redux-conn/LOAD_SUCCESS', function (key, data) {
  return {
    key: key,
    data: data
  };
});
export var loadFail = createAction('@redux-conn/LOAD_FAIL', function (key, error) {
  return {
    key: key,
    error: error
  };
});
var initialState = {
  loaded: false,
  loadState: {}
};
export var reducer = handleActions((_handleActions = {}, _handleActions[beginGlobalLoad] = function (state) {
  return _extends({}, state, {
    loaded: false
  });
}, _handleActions[endGlobalLoad] = function (state) {
  return _extends({}, state, {
    loaded: true
  });
}, _handleActions[load] = function (state, _ref) {
  var _extends2;

  var payload = _ref.payload;
  return _extends({}, state, {
    loadState: _extends({}, state.loadState, (_extends2 = {}, _extends2[payload.key] = {
      loading: true,
      loaded: false
    }, _extends2))
  });
}, _handleActions[loadSuccess] = function (state, _ref2) {
  var _extends3, _extends4;

  var _ref2$payload = _ref2.payload,
      key = _ref2$payload.key,
      data = _ref2$payload.data;
  return _extends({}, state, (_extends4 = {
    loadState: _extends({}, state.loadState, (_extends3 = {}, _extends3[key] = {
      loading: false,
      loaded: true,
      error: null
    }, _extends3))
  }, _extends4[key] = data, _extends4));
}, _handleActions[loadFail] = function (state, _ref3) {
  var _extends5;

  var _ref3$payload = _ref3.payload,
      key = _ref3$payload.key,
      error = _ref3$payload.error;
  return _extends({}, state, {
    loadState: _extends({}, state.loadState, (_extends5 = {}, _extends5[key] = {
      loading: false,
      loaded: false,
      error: error
    }, _extends5))
  });
}, _handleActions[clearKey] = function (state, _ref4) {
  var _extends6, _extends7;

  var payload = _ref4.payload;
  return _extends({}, state, (_extends7 = {
    loadState: _extends({}, state.loadState, (_extends6 = {}, _extends6[payload] = {
      loading: false,
      loaded: false,
      error: null
    }, _extends6))
  }, _extends7[payload] = null, _extends7));
}, _handleActions), initialState);
export var immutableReducer = function wrapReducer(immutableState, action) {
  // We need to convert immutable state to mutable state before our reducer can act upon it
  var mutableState;

  if (immutableState === undefined) {
    // if state is undefined (no initial state yet) then we can't convert it, so let the
    // reducer set the initial state for us
    mutableState = immutableState;
  } else {
    // Convert immutable state to mutable state so our reducer will accept it
    mutableState = getMutableState(immutableState);
  } // Run the reducer and then re-convert the mutable output state back to immutable state


  return getImmutableState(reducer(mutableState, action));
};
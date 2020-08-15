function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import { connect } from 'react-redux';
import { isPromise } from '../helpers/utils';
import { load, loadFail, loadSuccess } from '../store';
import { getMutableState, getImmutableState } from '../helpers/state';
/**
 * Wraps react components with data loaders
 * @param  {Array} asyncItems
 * @return {WrappedComponent}
 */

function wrapWithDispatch(asyncItems) {
  return asyncItems.map(function (item) {
    var key = item.key;
    if (!key) return item;
    return _extends({}, item, {
      promise: function promise(options) {
        var dispatch = options.store.dispatch;
        var next = item.promise(options); // NOTE: possibly refactor this with a breaking change in mind for future versions
        // we can return result of processed promise/thunk if need be

        if (isPromise(next)) {
          dispatch(load(key)); // add action dispatchers

          next.then(function (data) {
            return dispatch(loadSuccess(key, data));
          }).catch(function (err) {
            return dispatch(loadFail(key, err));
          });
        } else if (next) {
          dispatch(loadSuccess(key, next));
        }

        return next;
      }
    });
  });
}
/**
 * Exports decorator, which wraps React components with asyncConnect and connect at the same time
 * @param  {Array} asyncItems
 * @param  {Function} [mapStateToProps]
 * @param  {Object|Function} [mapDispatchToProps]
 * @param  {Function} [mergeProps]
 * @param  {Object} [options]
 * @return {Function}
 */


export function asyncConnect(asyncItems, mapStateToProps, mapDispatchToProps, mergeProps, options) {
  return function (Component) {
    Component.reduxAsyncConnect = wrapWithDispatch(asyncItems);

    var finalMapStateToProps = function finalMapStateToProps(state, ownProps) {
      var mutableState = getMutableState(state);
      var asyncStateToProps = asyncItems.reduce(function (result, _ref) {
        var _extends2;

        var key = _ref.key;

        if (!key) {
          return result;
        }

        return _extends({}, result, (_extends2 = {}, _extends2[key] = mutableState.reduxAsyncConnect[key], _extends2));
      }, {});

      if (typeof mapStateToProps !== 'function') {
        return asyncStateToProps;
      }

      return _extends({}, mapStateToProps(getImmutableState(mutableState), ownProps), {}, asyncStateToProps);
    };

    return connect(finalMapStateToProps, mapDispatchToProps, mergeProps, options)(Component);
  };
} // convenience export

export default asyncConnect;
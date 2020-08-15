function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import { matchRoutes } from 'react-router-config';
import { endGlobalLoad } from '../store';
/**
 * Tells us if input looks like promise or not
 * @param  {Mixed} obj
 * @return {Boolean}
 */

export function isPromise(obj) {
  return typeof obj === 'object' && obj && obj.then instanceof Function;
}
/**
 * Utility to be able to iterate over array of promises in an async fashion
 * @param  {Array} iterable
 * @param  {Function} iterator
 * @return {Promise}
 */

var mapSeries = Promise.mapSeries || function promiseMapSeries(iterable, iterator) {
  var length = iterable.length;
  var results = new Array(length);
  var i = 0;

  function iterateOverResults() {
    return iterator(iterable[i], i, iterable).then(function (result) {
      results[i] = result;
      i += 1;

      if (i < length) {
        return iterateOverResults();
      }

      return results;
    });
  }

  return iterateOverResults();
};
/**
 * We need to iterate over all components for specified routes.
 * Components array can include objects if named components are used:
 * https://github.com/rackt/react-router/blob/latest/docs/API.md#named-components
 *
 * @param components
 * @param iterator
 */


export function eachComponents(components, iterator) {
  var l = components.length;

  var _loop = function _loop(i) {
    var component = components[i];

    if (typeof component === 'object') {
      var keys = Object.keys(component);
      keys.forEach(function (key) {
        return iterator(component[key], i, key);
      });
    } else {
      iterator(component, i);
    }
  };

  for (var i = 0; i < l; i += 1) {
    _loop(i);
  }
}
/**
 * Returns flattened array of components that are wrapped with reduxAsyncConnect
 * @param  {Array} components
 * @return {Array}
 */

export function filterAndFlattenComponents(components) {
  var flattened = [];
  eachComponents(components, function (component) {
    if (component && component.reduxAsyncConnect) {
      flattened.push(component);
    }
  });
  return flattened;
}
/**
 * Returns an array of components that are wrapped
 * with reduxAsyncConnect
 * @param  {Array} branch
 * @return {Array}
 */

export function filterComponents(branch) {
  return branch.reduce(function (result, _ref) {
    var route = _ref.route,
        match = _ref.match;

    if (route.component && route.component.reduxAsyncConnect) {
      result.push([route.component, {
        route: route,
        match: match
      }]);
    }

    return result;
  }, []);
}
/**
 * Function that accepts components with reduxAsyncConnect definitions
 * and loads data
 * @param  {Object} data.routes - static route configuration
 * @param  {String} data.location - location object e.g. { pathname, query, ... }
 * @param  {Function} [data.filter] - filtering function
 * @return {Promise}
 */

export function loadAsyncConnect(_ref2) {
  var location = _ref2.location,
      _ref2$routes = _ref2.routes,
      routes = _ref2$routes === void 0 ? [] : _ref2$routes,
      _ref2$filter = _ref2.filter,
      filter = _ref2$filter === void 0 ? function () {
    return true;
  } : _ref2$filter,
      rest = _objectWithoutPropertiesLoose(_ref2, ["location", "routes", "filter"]);

  var layered = filterComponents(matchRoutes(routes, location.pathname));

  if (layered.length === 0) {
    return Promise.resolve();
  } // this allows us to have nested promises, that rely on each other's completion
  // cycle


  return mapSeries(layered, function (_ref3) {
    var component = _ref3[0],
        routeParams = _ref3[1];

    if (component == null) {
      return Promise.resolve();
    } // Collect the results of each component


    var results = [];
    var asyncItemsArr = [];
    var asyncItems = component.reduxAsyncConnect;
    asyncItemsArr.push.apply(asyncItemsArr, asyncItems); // get array of results

    results.push.apply(results, asyncItems.reduce(function (itemsResults, item) {
      if (filter(item, component)) {
        var promiseOrResult = item.promise(_extends({}, rest, {}, routeParams, {
          location: location,
          routes: routes
        }));

        if (isPromise(promiseOrResult)) {
          promiseOrResult = promiseOrResult.catch(function (error) {
            return {
              error: error
            };
          });
        }

        itemsResults.push(promiseOrResult);
      }

      return itemsResults;
    }, []));
    return Promise.all(results).then(function (finalResults) {
      return finalResults.reduce(function (finalResult, result, idx) {
        var key = asyncItemsArr[idx].key;

        if (key) {
          finalResult[key] = result;
        }

        return finalResult;
      }, {});
    });
  });
}
/**
 * Helper to load data on server
 * @param  {Mixed} args
 * @return {Promise}
 */

export function loadOnServer(args) {
  return loadAsyncConnect(args).then(function () {
    args.store.dispatch(endGlobalLoad());
  });
}
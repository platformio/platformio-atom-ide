/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Route, Switch } from 'react-router';
import { getActiveRoute, goTo } from '../helpers';

import PropTypes from 'prop-types';
import React from 'react';


export default class SubPages extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render() {
    return (
      <div>
        <div className='page-submenu btn-group btn-group-lg'>
          { this.props.routes.map(item => item.label && (
              <button onClick={ () => goTo(this.context.router.history, item.path, item.pathState) } key={ item.path } className={ ['btn', 'icon', `icon-${item.icon}`, getActiveRoute(this.props.routes, this.context.router.route.location) === item ? 'selected' : ''].join(' ') }>
                { item.label }
              </button>
            )) }
        </div>
        <Switch>
          { this.props.routes.slice(0).reverse().map(item => typeof item.component === 'function' ? (
              <Route path={ item.path }
                key={ item.path }
                exact={ item.exact }
                component={ item.component } />
              ) : (
              <Route path={ item.path }
                key={ item.path }
                exact={ item.exact }
                render={ () => item.component } />
              )) }
        </Switch>
      </div>
    );
  }

}

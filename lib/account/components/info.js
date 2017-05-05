/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
import { getShortUsername } from '../helpers';
import humanize from 'humanize';


export default class AccountInfo extends React.Component {
  static propTypes = {
    data: React.PropTypes.shape({
      username: React.PropTypes.string,
      currentPlan: React.PropTypes.string,
      upgradePlan: React.PropTypes.string,
      groups: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string,
        expire: React.PropTypes.number,
        permissions: React.PropTypes.arrayOf(React.PropTypes.string),
      })),
    }),
  }

  render() {
    return (
      <div className='account-information-page'>
        <section>
          <h1 className='section-heading icon icon-telescope'>General</h1>
          <p>
            Logged in as <code>{ getShortUsername(this.props.data.username) }</code>
          </p>
          <p>
            PIO Plus Plan: <code className='inline-block'>{ this.props.data.currentPlan }</code>
            { this.props.data.upgradePlan && <a className="inline-block btn btn-primary" href="https://pioplus.com/pricing.html">UPGRADE</a> }
          </p>
        </section>
        <section>
          <h1 className='section-heading icon icon-organization'>Groups</h1>
          { this.props.data.groups.map(group => (
              <div key={ group.name } className='pio-group block'>
                <h3 className='section-heading icon icon-star'>{ group.name }</h3>
                <p>
                  Expires:
                  { ' ' + (group.expire ? humanize.relativeTime(new Date(group.expire).getTime()) : 'never') }
                </p>
                <p>
                  Permissions:
                </p>
                <ul>
                  { group.permissions.map(permissionName => (
                      <li key={ permissionName }>
                        { permissionName }
                      </li>)
                    ) }
                </ul>
              </div>)
            ) }
        </section>
      </div>);
  }
}

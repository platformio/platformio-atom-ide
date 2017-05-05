/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';
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
        <div>
          <h1 className='section-heading icon icon-telescope'>General</h1>
          <dl className='row inset-panel padded'>
            <dt className='col-xs-2'>Logged in as</dt>
            <dd className='col-xs-10'>
              { this.props.data.username }
            </dd>
            <dt className='col-xs-2'>PIO Plus Plan</dt>
            <dd className='col-xs-10'>
              <a href='https://pioplus.com/pricing.html' className='inline-block'>
                { this.props.data.currentPlan }
              </a>
              { this.props.data.upgradePlan &&
                <a className='inline-block btn btn-primary' href='https://pioplus.com/pricing.html'>UPGRADE</a> }
              { this.props.data.upgradePlan &&
                <div className='block text'>
                  <span className='icon icon-question'></span> Please do not forget to re-login after account upgrade to apply the new permissions.
                </div>
              }
            </dd>
          </dl>
        </div>
        <div className='account-groups'>
          <h1 className='section-heading icon icon-organization'>Groups</h1>
          { this.props.data.groups.map(group => (
              <dl key={ group.name } className='row'>
                <dt className='col-xs-2'>Name</dt>
                <dd className='col-xs-10'>
                  { group.name }
                </dd>
                <dt className='col-xs-2'>Expires</dt>
                <dd className='col-xs-10'>
                  <span title={ group.expire ? new Date(group.expire) : '' }>{ ' ' + (group.expire ? humanize.relativeTime(new Date(group.expire).getTime()) : 'never') }</span>
                </dd>
                <dt className='col-xs-2'>Permissions</dt>
                <dd className='col-xs-10'>
                  <ul>
                    { group.permissions.map(permissionName => (
                        <li key={ permissionName }>
                          { permissionName }
                        </li>)
                      ) }
                  </ul>
                </dd>
              </dl>)
            ) }
        </div>
      </div>);
  }
}

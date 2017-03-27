/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react';


export default class PlatformDetailPackages extends React.Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      type: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      requirements: React.PropTypes.string.isRequired,
      version: React.PropTypes.string.isRequired,
      originalVersion: React.PropTypes.string,
      url: React.PropTypes.string,
      optional: React.PropTypes.string,
    }))
  }

  render() {
    if (!this.props.items || this.props.items.length === 0) {
      return null;
    }
    return (
      <div>
        <h2 className='section-heading icon icon-package'>Packages</h2>
        { this.props.items[0].requirements ? (
          <div className='block'>
            <span className='icon icon-question'></span>Optional packages will be installed automatically depending on a build environment.
          </div>
          ) : (
          <div className='block'>
            <span className='icon icon-question'></span>More detailed information about the package requirements and installed versions is available for the installed platforms.
          </div>
          ) }
        <table className='native-key-bindings table table-hover' tabIndex='-1'>
          <thead>
            <tr>
              <th>
                Name
              </th>
              <th>
                Type
              </th>
              <th>
                Optional
              </th>
              <th>
                Requirements
              </th>
              <th>
                Installed
              </th>
              <th>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            { this.props.items.map(item => (
                <tr>
                  <td>
                    { item.url ? (
                      <a href={ item.url }>
                        { item.name }
                      </a>
                      ) : (
                      <span>{ item.name }</span>
                      ) }
                  </td>
                  <td>
                    { item.type }
                  </td>
                  <td className='text-center'>
                    { item.optional ? (
                      <span className='icon icon-check'></span>
                      ) : ('') }
                  </td>
                  <td>
                    { item.requirements }
                  </td>
                  <td>
                    { item.version }
                    { item.originalVersion ? (
                      <span>{ ' ' }({ item.originalVersion })</span>
                      ) : ('') }
                  </td>
                  <td>
                    { item.description }
                  </td>
                </tr>
              )) }
          </tbody>
        </table>
      </div>
    );
  }

}

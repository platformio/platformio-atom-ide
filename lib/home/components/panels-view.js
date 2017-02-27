/** @babel */
/** @jsx etch.dom */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import { EtchComponent } from '../../view';
import etch from 'etch';

export class PanelsView extends EtchComponent {

  constructor(props) {
    // assign panel references
    props.items.map((item, index) => item.component.ref = `panel-${index}`);
    super(props);
  }

  update(props) {
    super.update(props);
    if (props.hasOwnProperty('selectedIndex')) {
      this.refs[`panel-${props.selectedIndex}`].showPanel();
    }
  }

  render() {
    return (
      <div className='panels'>
        { this.props.items.map((item, index) => (
            <div className='panels-item' style={ { display: this.props.selectedIndex === index ? 'block' : 'none' } }>
              <section className='section'>
                <div className='section-container'>
                  { item.component }
                </div>
              </section>
            </div>
          )) }
      </div>
    );
  }

}

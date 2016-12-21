/** @babel */
/** @jsx etchDom */

/**
 * Copyright (C) 2016 Ivan Kravets. All rights reserved.
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import EtchComponent from '../../etch-component';
import { dom as etchDom } from 'etch';

export class PanelsView extends EtchComponent {

  constructor(props) {
    // assign panel references
    props.items.map((item, index) => item.component.ref = `panel-${index}`);
    super(props);
  }

  update(props) {
    super.update(props);
    if (props.hasOwnProperty('selectedIndex')) {
      this.refs[`panel-${props.selectedIndex}`].onDidPanelSelect();
    }
  }

  render() {
    return (
      <div className='panels'>
         {this.props.items.map((item, index) =>
         <div className='panels-item' style={{
           display: this.props.selectedIndex === index ? 'block' : 'none'
         }}>
           <section className='section'>
             <div className='section-container'>{item.component}</div>
           </section>
         </div>
      )}
      </div>
    );
  }

}

export class BasePanel extends EtchComponent {

  /**
   * Will be called when panel has been selected
   */
  onDidPanelSelect() {

  }

}

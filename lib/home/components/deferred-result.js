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

const SPINNER_CLASSES = ['loading', 'loading-spinner-tiny', 'inline-block'];

export default class DeferredResult extends EtchComponent {


  constructor(props) {
    super(props);
    this.props.defer.then((result) => {
      SPINNER_CLASSES.map((className) => this.element.classList.remove(className));
      this.update({result: result});
    });
  }

  render() {
    return (<span className={SPINNER_CLASSES.join(' ')}>{'result' in this.props ? this.props.result : ''}</span>);
  }
}

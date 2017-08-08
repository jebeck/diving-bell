import _ from 'lodash';
import React, { PureComponent } from 'react';

import BreadcrumbsWrapper from './BreadcrumbsWrapper';

/* eslint-disable no-undef */

class Try extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      started: false,
    };
  }

  handleStart() {
    this.setState(
      () => ({ started: true }),
      () => {
        webgazer.showPredictionPoints(false).resume();
      }
    );
  }

  render() {
    return (
      <BreadcrumbsWrapper
        currentLocation={_.get(this.props, ['location', 'pathname'], '/')}
      />
    );
  }
}

export default Try;

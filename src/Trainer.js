import React, { PureComponent } from 'react';
import { Loader } from 'semantic-ui-react';

import './Trainer.css';

/* eslint-disable no-undef */

class Trainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selected: false,
      x: null,
      y: null,
    };
  }

  componentDidMount() {
    const { bottom, left } = this.select.getBoundingClientRect();

    function withinSelect(x, y) {
      if (x >= left && y <= bottom) {
        return true;
      }
      return false;
    }

    let timer;
    webgazer
      .setRegression('threadedRidge')
      .setTracker('clmtrackr')
      .setGazeListener((data, elapsed) => {
        if (data != null) {
          const selected = withinSelect(data.x, data.y);
          if (selected) {
            this.setState(() => ({ selected }));
          }
          if (timer) {
            if (!selected) {
              this.setState(() => ({ selected }));
              clearTimeout(timer);
              timer = null;
            }
          } else {
            if (selected) {
              timer = setTimeout(() => {
                this.props.recordClick();
              }, 1000);
            }
          }
        }
      })
      .begin()
      .showPredictionPoints(true);
  }

  componentWillUnmount() {
    webgazer.showPredictionPoints(false).clearGazeListener().pause();
  }

  render() {
    const selectedClass = this.state.selected ? 'selected' : 'unselected';
    return (
      <div
        id="target"
        ref={node => {
          this.select = node;
        }}
        style={{
          borderRadius: '0.5rem',
          position: 'absolute',
          top: '6rem',
          right: '1rem',
          height: 'calc(100vh - 7rem)',
          width: '60vw',
        }}
      >
        <div
          className={selectedClass}
          style={{ background: 'white', height: '100%', width: '100%' }}
        />
        <Loader active={this.state.selected} />
      </div>
    );
  }
}

export default Trainer;

import React, { PureComponent } from 'react';

import './Target.css';

/* eslint-disable no-undef */

class Target extends PureComponent {
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
    webgazer.setGazeListener((data, elapsed) => {
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
              this.props.selectLetter();
            }, 500);
          }
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.started && nextProps.started) {
      webgazer.showPredictionPoints(true).resume();
    } else if (this.props.started && !nextProps.started) {
      webgazer.showPredictionPoints(false).pause();
    }
  }

  componentWillUnmount() {
    webgazer.showPredictionPoints(false).clearGazeListener().pause();
  }

  render() {
    const selectedClass = this.state.selected ? 'selected' : 'unselected';
    return (
      <div
        className={selectedClass}
        id="#target"
        ref={node => {
          this.select = node;
        }}
        style={{
          borderRadius: '0.5rem',
          position: 'absolute',
          top: '6rem',
          right: '1rem',
          height: 'calc(100vh - 7rem)',
          width: '45vw',
        }}
      />
    );
  }
}

export default Target;

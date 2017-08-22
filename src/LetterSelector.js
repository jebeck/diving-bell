import { PureComponent } from 'react';

/* eslint-disable no-undef */

class LetterSelector extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      blinked: false,
      firstBlinkLetter: null,
      firstBlinkTime: null,
    };
  }

  componentDidMount() {
    const { doubleBlinkThreshold } = this.props;

    let blinkCount = 0;
    webgazer.setGazeListener((data, elapsed) => {
      if (data != null) {
        const blinked = _.get(data, ['all', 0, 'blinked'], false);
        if (blinked) {
          if (!this.state.blinked) {
            this.setState(() => ({
              blinked: true,
              firstBlinkLetter: this.props.currentLetter,
              firstBlinkTime: elapsed,
            }));
            setTimeout(() => {
              this.setState(() => ({
                blinked: false,
                firstBlinkLetter: null,
                firstBlinkTime: null,
              }));
              blinkCount = 0;
            }, doubleBlinkThreshold);
          }
        } else {
          if (this.state.blinked) {
            blinkCount += 1;
            if (
              blinkCount >= 2 &&
              elapsed - this.state.firstBlinkTime < doubleBlinkThreshold &&
              this.state.firstBlinkLetter === this.props.currentLetter
            ) {
              this.props.selectLetter();
              blinkCount = 0;
            }
            this.setState(() => ({
              blinked: false,
              firstBlinkLetter: null,
              firstBlinkTime: null,
            }));
          }
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.started && nextProps.started) {
      webgazer.showPredictionPoints(false).resume();
    } else if (this.props.started && !nextProps.started) {
      webgazer.showPredictionPoints(false).pause();
    }
  }

  componentWillUnmount() {
    webgazer.showPredictionPoints(false).clearGazeListener().pause();
  }

  render() {
    return null;
  }
}

LetterSelector.defaultProps = {
  doubleBlinkThreshold: 250,
};

export default LetterSelector;

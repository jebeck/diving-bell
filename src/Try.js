import _ from 'lodash';
import React, { PureComponent } from 'react';
import {
  Button,
  Form,
  Grid,
  Header,
  Icon,
  Modal,
  Segment,
  TextArea,
} from 'semantic-ui-react';
import update from 'immutability-helper';

import BreadcrumbsWrapper from './BreadcrumbsWrapper';
import FreqOrderedAlphabet from './FreqOrderedAlphabet';
import Target from './Target';

/* eslint-disable no-undef */

class Try extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: 0,
      currentLetter: null,
      letters: [],
      started: false,
    };
  }

  static defaultProps = {
    freqOrderedLetters: {
      en: [
        'E',
        'T',
        'A',
        'O',
        'I',
        'N',
        'S',
        'R',
        'H',
        'D',
        'L',
        'U',
        'C',
        'M',
        'F',
        'Y',
        'W',
        'G',
        'P',
        'B',
        'V',
        'K',
        'X',
        'Q',
        'J',
        'Z',
      ],
      fr: [
        'E',
        'S',
        'A',
        'R',
        'I',
        'N',
        'T',
        'U',
        'L',
        'O',
        'M',
        'D',
        'P',
        'C',
        'F',
        'B',
        'V',
        'H',
        'G',
        'J',
        'Q',
        'Z',
        'Y',
        'X',
        'K',
        'W',
      ],
    },
    locale: 'en',
  };

  handleClose = e => {
    this.setState({ modalOpen: false });
  };

  handleOpen = e => {
    this.setState({ modalOpen: true });
  };

  handlePause = () => {
    clearInterval(this.scanner);
    this.setState(() => ({ started: false }));
  };

  handleStart = () => {
    this.setState(
      (state, props) => ({
        currentLetter:
          props.freqOrderedLetters[props.locale][state.currentIndex],
        started: true,
      }),
      () => {
        this.scanner = setInterval(() => {
          this.setState((state, props) => {
            const i = state.currentIndex;
            let newIndex = i + 1;
            if (newIndex === props.freqOrderedLetters[props.locale].length) {
              newIndex = 0;
            }
            return {
              currentIndex: newIndex,
              currentLetter: props.freqOrderedLetters[props.locale][newIndex],
            };
          });
        }, 2000);
      }
    );
  };

  selectLetter = () => {
    this.setState((state, props) => {
      if (state.currentLetter !== null) {
        return {
          currentIndex: 0,
          currentLetter: props.freqOrderedLetters[props.locale][0],
          letters: update(state.letters, { $push: [state.currentLetter] }),
        };
      }
    });
  };

  render() {
    return (
      <BreadcrumbsWrapper
        containerStyle={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
        currentLocation={_.get(this.props, ['location', 'pathname'], '/')}
      >
        <Modal
          trigger={
            <Button
              basic
              color="red"
              compact
              icon="help"
              onClick={this.handleOpen}
              size="huge"
            />
          }
          open={this.state.modalOpen}
          onClose={this.handleClose}
          basic
          size="small"
        >
          <Header icon="help" content="Help!" />
          <Modal.Content>
            <p>
              To select a letter, look at the target area on the right when the
              letter you want to select is active.
            </p>
            <p>
              If lighting conditions and/or computer performance are poor,
              making small circles and/or clicking with your cursor as you move
              and then hold your gaze on the target area will help.
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleClose}>
              <Icon name="checkmark" /> Got it, thanks
            </Button>
          </Modal.Actions>
        </Modal>
        {this.state.modalOpen
          ? null
          : <Target
              selectLetter={this.selectLetter}
              started={this.state.started}
            />}
        <Grid
          columns={3}
          textAlign="right"
          stretched
          style={{ height: 'calc(100vh - 4rem)', width: '90vw' }}
        >
          <Grid.Column stretched verticalAlign="bottom">
            <Grid.Row>
              <FreqOrderedAlphabet
                currentLetter={this.state.currentLetter}
                letters={this.props.freqOrderedLetters[this.props.locale]}
              />
            </Grid.Row>
            <Grid.Row>
              <Segment
                basic
                style={{
                  fontSize: '12rem',
                  lineHeight: '16rem',
                  padding: '1rem',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {this.state.currentLetter || '_'}
              </Segment>
            </Grid.Row>
            <Grid.Row>
              <Segment basic style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Form>
                  <TextArea
                    autoHeight
                    placeholder="Your selected letters will appear here"
                    readOnly
                    value={this.state.letters.join('')}
                  />
                </Form>
              </Segment>
            </Grid.Row>
            <Grid.Row>
              <Button
                disabled={!this.state.started}
                icon="pause"
                content="Pause"
                labelPosition="left"
                onClick={this.handlePause}
              />
              <Button
                disabled={this.state.started}
                icon="play"
                content="Start"
                labelPosition="left"
                onClick={this.handleStart}
                primary
              />
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </BreadcrumbsWrapper>
    );
  }
}

export default Try;

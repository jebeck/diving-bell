import _ from 'lodash';
import React, { PureComponent } from 'react';
import {
  Button,
  Form,
  Grid,
  Segment,
  TextArea,
  Transition,
} from 'semantic-ui-react';
import update from 'immutability-helper';

import BreadcrumbsWrapper from './BreadcrumbsWrapper';
import FreqOrderedAlphabet from './FreqOrderedAlphabet';
import LetterSelector from './LetterSelector';

/* eslint-disable no-undef */

class Try extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: 0,
      currentLetter: null,
      letters: [],
      showingHelpText: false,
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
    scanningPace: 2000,
  };

  toggleHelpText = e => {
    this.setState(state => ({ showingHelpText: !state.showingHelpText }));
  };

  handlePause = () => {
    clearInterval(this.scanner);
    this.setState(() => ({ started: false }));
  };

  handleReset = () => {
    clearInterval(this.scanner);
    this.setState(() => ({
      currentIndex: 0,
      currentLetter: null,
      letters: [],
      started: false,
    }));
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
        }, this.props.scanningPace);
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
        <div
          style={{
            alignItems: 'baseline',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Transition visible={this.state.showingHelpText}>
            <div>
              To select a letter, blink twice while the letter you want to
              select is active.&nbsp;&nbsp;&nbsp;
            </div>
          </Transition>
          <Button
            basic
            color="red"
            compact
            icon={this.state.showingHelpText ? 'cancel' : 'help'}
            onClick={this.toggleHelpText}
            size="huge"
          />
        </div>
        {this.state.modalOpen
          ? null
          : <LetterSelector
              currentLetter={this.state.currentLetter}
              selectLetter={this.selectLetter}
              started={this.state.started}
            />}
        <Grid
          columns={2}
          divided
          textAlign="right"
          style={{ height: 'calc(100vh - 4rem)', width: '90vw' }}
        >
          <Grid.Column verticalAlign="middle">
            <Grid.Row>
              <Segment basic style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Form>
                  <TextArea
                    placeholder="Your selected letters will appear here"
                    readOnly
                    rows={16}
                    value={this.state.letters.join('')}
                  />
                </Form>
              </Segment>
            </Grid.Row>
            <Grid.Row>
              <Button
                color="orange"
                disabled={!this.state.started}
                floated="left"
                icon="delete"
                content="Reset"
                labelPosition="left"
                onClick={this.handleReset}
              />
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
            <Grid.Row />
          </Grid.Column>
          <Grid.Column verticalAlign="middle">
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
          </Grid.Column>
        </Grid>
      </BreadcrumbsWrapper>
    );
  }
}

export default Try;

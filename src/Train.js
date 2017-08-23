import _ from 'lodash';
import React, { PureComponent } from 'react';
import {
  Button,
  Grid,
  Header,
  Icon,
  Modal,
  Statistic,
} from 'semantic-ui-react';

import BreadcrumbsWrapper from './BreadcrumbsWrapper';
import Trainer from './Trainer';

class Train extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cancelled: false,
      clicked: 0,
      modalOpen: true,
    };
  }

  handleCancel = e => {
    this.setState(() => ({ cancelled: true }));
    (function cancel() {
      // eslint-disable-next-line no-undef
      webgazer.showPredictionPoints(false).end().clearGazeListener();
      window.localStorage.clear();
    })();
  };

  handleClose = e => {
    this.setState({ modalOpen: false });
  };

  handleOpen = e => {
    this.setState({ modalOpen: true });
  };

  handleProceed = e => {
    this.props.history.push('/main');
  };

  recordClick = e => {
    const { clicked: clicks } = this.state;
    this.setState(() => ({ clicked: clicks + 1 }));
  };

  render() {
    const clicks = this.state.clicked;
    const times = clicks === 1 ? 'time' : clicks >= 5 ? 'times!' : 'times';
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
          <Header icon="help" content="How to train WebGazer" />
          <Modal.Content>
            <p>
              To train WebGazer, start by moving your mouse cursor to a location
              and clicking while you focus your gaze on it.
            </p>
            <p>
              The small yellow circle indicates WebGazer's current estimation of
              your gaze location.
            </p>
            <p>
              To train WebGazer, you must hold your gaze and cursor on the
              active area at the right side of the screen for at least one
              second, and you must do this five times. Between each one-second
              gaze holding, you must move your gaze and cursor to the left side
              of the screen away from the active area and then back again to
              continue the training.
            </p>
            <p>
              The active area starts blank and fades into a target-shaped
              gradient the longer your gaze remains on it. The spinner in the
              center of the target is there to help you focus your gaze.
            </p>
            <p>
              If lighting conditions and/or computer performance are poor,
              making small circles and/or clicking with your cursor as you hold
              your gaze will aid in the training process.
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
          : <Trainer
              clicks={clicks}
              completeTraining={this.completeTraining}
              recordClick={this.recordClick}
            />}
        <Grid
          columns={3}
          textAlign="right"
          stretched
          style={{ height: 'calc(100vh - 4rem)', width: '90vw' }}
        >
          <Grid.Column stretched verticalAlign="bottom">
            <Grid.Row>
              Clicked <Statistic value={clicks} label={`"Clicks"`} />{' '}
              <span>{times}</span>
            </Grid.Row>
            <Grid.Row>
              <Button
                icon="cancel"
                content="Cancel"
                labelPosition="left"
                onClick={this.handleCancel}
              />
              <Button
                disabled={this.state.cancelled || clicks < 5}
                icon="checkmark"
                content="Proceed"
                labelPosition="left"
                onClick={this.handleProceed}
                primary
              />
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </BreadcrumbsWrapper>
    );
  }
}

export default Train;

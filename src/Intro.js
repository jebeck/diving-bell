import _ from 'lodash';
import React, { PureComponent } from 'react';
import {
  Button,
  Container,
  Header,
  Icon,
  Modal,
  Segment,
} from 'semantic-ui-react';

import BreadcrumbsWrapper from './BreadcrumbsWrapper';

class Intro extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
    };
  }

  handleClose = e => {
    this.setState({ modalOpen: false });
  };

  handleOpen = e => {
    this.setState({ modalOpen: true });
  };

  handleProceed = e => {
    this.props.history.push('/train');
  };

  render() {
    return (
      <BreadcrumbsWrapper
        currentLocation={_.get(this.props, ['location', 'pathname'], '/')}
      >
        <Container
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 4rem)',
            width: '60%',
          }}
        >
          <Header icon="unlock" content="Permissions!" size="large" />
          <Segment size="large">
            <p>
              In order to try out this prototype, you <strong>must</strong>{' '}
              allow webcam access in the browser pop-up requesting this on the
              next page!
            </p>
          </Segment>
          <Container
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            <Modal
              trigger={<Button onClick={this.handleOpen}>Details</Button>}
              open={this.state.modalOpen}
              onClose={this.handleClose}
              basic
              size="small"
            >
              <Header icon="info" content="Details..." />
              <Modal.Content>
                <p>
                  To replace the "partner" in traditional partner-assisted
                  scanning, this prototype replaces the partner's reading
                  through the frequency-ordered list of letters of the alphabet
                  with an application interface that animates through the
                  frequency-ordered letters on a timer. To replace the partner's
                  awareness of the user's letter selection via blinking, this
                  prototype employs gaze detection in a target area of the
                  screen: a held gaze in the target area meeting or exceeding a
                  duration threshold counts as selection of the current letter.
                </p>
                <p>
                  This prototype employs the{' '}
                  <a
                    href="https://webgazer.cs.brown.edu/"
                    rel="noopener noreferrer"
                    style={{ color: '#b5cfe8' }}
                    target="_blank"
                  >
                    WebGazer.js
                  </a>{' '}
                  library for eye-tracking on the web. WebGazer tracks a user's
                  eye movements using the video stream provided by the user's
                  webcam in combination with algorithmic processing of that
                  image. Gaze target rather than blink action is used because
                  WebGazer has not yet fully integrated blink detection into the
                  library's functionality.
                </p>
                <p>
                  Because WebGazer relies on a webcam video stream, allowing
                  webcam permissions is necessary to try out this prototype:{' '}
                  <strong>
                    you <em>must</em> click 'Allow' on the next screen when the
                    browser alert asking for webcam access pops up
                  </strong>. Note that all image processing is done in the local
                  web browser; there is no connection to a server and no
                  transmission or storage of the webcam video stream or
                  component static images.
                </p>
              </Modal.Content>
              <Modal.Actions>
                <Button color="green" inverted onClick={this.handleClose}>
                  <Icon name="checkmark" /> Got it, thanks
                </Button>
              </Modal.Actions>
            </Modal>
            <Button onClick={this.handleProceed} primary>
              Proceed
            </Button>
          </Container>
        </Container>
      </BreadcrumbsWrapper>
    );
  }
}

export default Intro;

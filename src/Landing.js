import React, { PureComponent } from 'react';
import {
  Button,
  Container,
  Header,
  Icon,
  Modal,
  Segment,
} from 'semantic-ui-react';

class Landing extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { modalOpen: false };
  }

  handleClose = e => {
    this.setState({ modalOpen: false });
  };

  handleOpen = e => {
    this.setState({ modalOpen: true });
  };

  handleTry = e => {
    this.props.history.push('/intro');
  };

  render() {
    return (
      <Container>
        <Container
          style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '32px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Header as="h1" size="huge">
            Escape the Diving Bell!
          </Header>
          <Header as="h3">
            partner-less{' '}
            <a
              href="https://en.wikipedia.org/wiki/Partner-assisted_scanning"
              rel="noopener noreferrer"
              target="_blank"
              title="Wikipedia: partner-assisted scanning"
            >
              partner-assisted scanning
            </a>
          </Header>
          <Container
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            <Modal
              trigger={<Button onClick={this.handleOpen}>Huh?</Button>}
              open={this.state.modalOpen}
              onClose={this.handleClose}
              basic
              size="small"
            >
              <Header
                icon="info"
                content="What's partner-assisted scanning? And how could you make it partner-less?"
              />
              <Modal.Content>
                <p>
                  <a
                    href="https://en.wikipedia.org/wiki/Partner-assisted_scanning"
                    rel="noopener noreferrer"
                    style={{ color: '#b5cfe8' }}
                    target="_blank"
                    title="Wikipedia: partner-assisted scanning"
                  >
                    Partner-assisted scanning
                  </a>{' '}
                  is an alternative communication technique that enables a
                  person with severe speech impairments—most notably,
                  "locked-in" syndrome—to communicate.
                </p>
                <p>
                  Traditionally, partner-assisted scanning consists in the
                  partner reading through a frequency-ordered list of the
                  letters of the alphabet and the locked-in individual giving
                  whatever small signal they are capable of—for example,
                  blinking—to select a letter.
                </p>
                <p>
                  This proof-of-concept web application replaces the "partner"
                  in partner-assisted scanning with webcam-based blink detection
                  via the open-source library{' '}
                  <a
                    href="https://webgazer.cs.brown.edu/"
                    rel="noopener noreferrer"
                    style={{ color: '#b5cfe8' }}
                    target="_blank"
                  >
                    WebGazer.js
                  </a>.
                </p>
              </Modal.Content>
              <Modal.Actions>
                <Button color="green" inverted onClick={this.handleClose}>
                  <Icon name="checkmark" /> Got it, thanks
                </Button>
              </Modal.Actions>
            </Modal>
            <Button onClick={this.handleTry} primary>
              Try it
            </Button>
          </Container>
        </Container>
        <Container
          style={{
            height: '20vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <Segment basic>
            Inspired by Jean-Dominique Bauby's memoir{' '}
            <em>The Diving Bell and the Butterfly</em>
          </Segment>
        </Container>
      </Container>
    );
  }
}

export default Landing;

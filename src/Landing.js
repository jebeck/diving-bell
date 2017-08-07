import React from 'react';
import { Button, Container, Header, Segment } from 'semantic-ui-react';

const Landing = () =>
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
        The Diving Bell
      </Header>
      <Header as="h3">
        partner-less{' '}
        <a
          href="https://en.wikipedia.org/wiki/Partner-assisted_scanning"
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
        <Button>Huh?</Button>
        <Button href="/intro" primary>
          Next
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
  </Container>;

export default Landing;

import React, { PureComponent } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Intro from './Intro';
import Landing from './Landing';

class App extends PureComponent {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route path="/intro" component={Intro} />
        </Switch>
      </Router>
    );
  }
}

export default App;

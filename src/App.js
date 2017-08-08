import React, { PureComponent } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Intro from './Intro';
import Landing from './Landing';
import Train from './Train';
import Try from './Try';

class App extends PureComponent {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route path="/intro" component={Intro} />
          <Route path="/train" component={Train} />
          <Route path="/main" component={Try} />
        </Switch>
      </Router>
    );
  }
}

export default App;

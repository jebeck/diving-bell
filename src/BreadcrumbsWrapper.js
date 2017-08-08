import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Container } from 'semantic-ui-react';

const BreadcrumbsWrapper = props => {
  const { currentLocation } = props;
  const paths = {
    home: '/',
    intro: '/intro',
    train: '/train',
    try: '/main',
  };
  const containerStyle = _.get(props, 'containerStyle', {});
  return (
    <Container style={{ margin: '1rem 0', ...containerStyle }}>
      <Breadcrumb size="large">
        <Breadcrumb.Section active={currentLocation === paths.home}>
          <Link to={paths.home}>Home</Link>
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon="right angle" />
        <Breadcrumb.Section active={currentLocation === paths.intro}>
          <Link to={paths.intro}>Intro</Link>
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon="right angle" />
        <Breadcrumb.Section active={currentLocation === paths.train}>
          <Link to={paths.train}>Train</Link>
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon="right angle" />
        <Breadcrumb.Section active={currentLocation === paths.try}>
          <Link to={paths.try}>Try</Link>
        </Breadcrumb.Section>
      </Breadcrumb>
      {props.children}
    </Container>
  );
};

export default BreadcrumbsWrapper;

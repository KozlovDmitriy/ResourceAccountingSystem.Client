import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './components/Home';
import HousesGrid from './components/HousesGrid';

export const routes = <Layout>
    <Route exact path="/" render={() => (<Redirect to="/houses/1" />)} />
    <Route path='/houses/:page?' component={HousesGrid} />
</Layout>;

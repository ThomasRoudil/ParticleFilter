import React from 'react';
import {Router} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import {createBrowserHistory} from 'history';

import Routes from './Routes';
import {SimulationProvider} from 'store/Simulation';
import {LoadingProvider} from 'store/Loading';

import './App.scss';

const browserHistory = createBrowserHistory();


export default () => (
    <LoadingProvider>
        <SimulationProvider>
            <Router history={browserHistory}>
                <Routes/>
            </Router>
        </SimulationProvider>
    </LoadingProvider>
)

serviceWorker.register();
import React, {lazy, Suspense} from 'react';
import {Loader} from 'components';

import './App.scss';

import {SimulationProvider} from 'store/Simulation';
import {LoadingProvider} from 'store/Loading';

const Dashboard = lazy(() => import('views/Dashboard'));


export default () => (
    <Suspense fallback={<Loader open={true}/>}>

        <LoadingProvider>
            <SimulationProvider>
                <Dashboard/>
            </SimulationProvider>
        </LoadingProvider>
    </Suspense>
)
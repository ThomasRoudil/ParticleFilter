import React from 'react';
import './App.scss';
import Dashboard from "./views/Dashboard";
import {SimulationProvider} from 'store/Simulation';
import {LoadingProvider} from 'store/Loading';


export default () => (
    <LoadingProvider>
        <SimulationProvider>
            <Dashboard/>
        </SimulationProvider>
    </LoadingProvider>
)
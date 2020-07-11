import React from 'react';
import './App.scss';
import Dashboard from "./views/Dashboard";
import {ContextProvider} from 'store/Simulation';


export default () => (
    <ContextProvider>
        <Dashboard/>
    </ContextProvider>
)
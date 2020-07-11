import React from 'react';
import './App.scss';
import Dashboard from "./views/Dashboard";
import {ContextProvider} from 'store/Heightmap';


export default () => (
    <ContextProvider>
        <Dashboard/>
    </ContextProvider>
)
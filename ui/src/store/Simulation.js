import React, {createContext, useState} from 'react';

export const Simulation = createContext({
    simulation: null,
    setSimulation: () => {
    }
});


export const SimulationProvider = (props) => {

    const setSimulation = simulation => {
        setState({...state, simulation: simulation});
        localStorage.setItem('NPF_simulation', JSON.stringify(simulation));
    };

    const initState = {
        simulation: JSON.parse(localStorage.getItem('NPF_simulation')) || {
            filename: null,
            positions: [],
            tensor_particles: []
        },
        setSimulation: setSimulation
    };

    const [state, setState] = useState(initState);

    return (
        <Simulation.Provider value={state}>
            {props.children}
        </Simulation.Provider>
    )
};

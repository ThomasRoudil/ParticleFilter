import React, {createContext, useState} from 'react';

export const Simulation = createContext({
    simulation: null,
    setSimulation: () => {
    }
});


export const SimulationProvider = (props) => {

    const setSimulation = simulation => {
        setState({...state, simulation: simulation});
    };

    const initState = {
        simulation: {
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

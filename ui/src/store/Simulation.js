import React, {createContext, useState} from 'react';

export const Simulation = createContext({
    simulation: null,
    setSimulation: () => {
    }
});


export const SimulationProvider = (props) => {

    const setSimulation = simulation => {
        setState({...state, simulation: simulation});
        localStorage.setItem('NPF_filename', JSON.stringify(simulation.filename || null));
        localStorage.setItem('NPF_positions', JSON.stringify(simulation.positions || []));
        localStorage.setItem('NPF_altitude_profile', JSON.stringify(simulation.altitude_profile || []));
    };

    const initState = {
        simulation: {
            filename: JSON.parse(localStorage.getItem('NPF_filename')) || null,
            positions: JSON.parse(localStorage.getItem('NPF_positions')) || [],
            altitude_profile: JSON.parse(localStorage.getItem('NPF_altitude_profile')) || [],
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
}

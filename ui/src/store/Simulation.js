import React from 'react';

export const Context = React.createContext({
    simulation: null,
    setSimulation: () => {}
});


export const ContextProvider = (props) => {

    const setSimulation = simulation => {
        setState({...state, simulation: simulation});
    };

    const initState = {
        simulation: {
            filename: null,
            positions: [],
            particle_filters: []
        },
        setSimulation: setSimulation
    };

    const [state, setState] = React.useState(initState);

    return (
        <Context.Provider value={state}>
            {props.children}
        </Context.Provider>
    )
};

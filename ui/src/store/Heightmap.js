import React from 'react';

export const Context = React.createContext({
    heightmap: null,
    setHeightmap: () => {}
});


export const ContextProvider = (props) => {

    const setHeightmap = heightmap => {
        setState({...state, heightmap: heightmap});
    };

    const initState = {
        heightmap: 'mountains.png',
        setHeightmap: setHeightmap
    };

    const [state, setState] = React.useState(initState);

    return (
        <Context.Provider value={state}>
            {props.children}
        </Context.Provider>
    )
};

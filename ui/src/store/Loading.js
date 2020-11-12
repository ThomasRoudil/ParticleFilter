import React, {createContext, useState} from 'react';
import {Loader} from 'components';

export const LoadingContext = createContext({
    loading: false,
    setLoading: () => {}
});


export const LoadingProvider = props => {

    const setLoading = loading => {
        setState({...state, loading: loading});
    };

    const initState = {
        loading: false,
        setLoading: setLoading
    };

    const [state, setState] = useState(initState);

    return (
        <LoadingContext.Provider value={state}>
            <Loader open={state.loading} full/>
            {props.children}
        </LoadingContext.Provider>
    )
};

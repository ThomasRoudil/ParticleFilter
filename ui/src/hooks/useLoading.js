import {useContext} from 'react';
import {LoadingContext} from 'store/Loading';

function useLoading() {
    return useContext(LoadingContext);
}

export default useLoading;
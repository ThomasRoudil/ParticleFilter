import React from 'react';
import {Layout} from 'layout'
import {Route as RouterRoute} from 'react-router-dom';

function Route(props) {
    const {component: Component, ...rest} = props;

    return (
        <RouterRoute
            {...rest}
            render={matchProps => <Layout>
                <Component {...matchProps} />
            </Layout>}
        />
    )
}

export default Route;

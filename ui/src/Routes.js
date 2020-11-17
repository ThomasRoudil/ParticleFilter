import React, {lazy, Suspense} from 'react';
import {Redirect, Switch} from 'react-router-dom';

import {Loader, Route} from 'components';
import {Layout} from 'layout';

const ParticleFilter2D = lazy(() => import('views/ParticleFilter2D'));
const ParticleFilter3D = lazy(() => import('views/ParticleFilter3D'));

const FallBack = ({layout: Layout}) => {

    return <Layout>
        <Loader open disableShrink/>
    </Layout>
};

function Routes() {

    return (
        <Suspense fallback={<FallBack layout={Layout}/>}>
            <Switch>
                <Route
                    component={ParticleFilter2D}
                    exact
                    path='/particle-filter/2D'
                />
                <Route
                    component={ParticleFilter3D}
                    exact
                    path='/particle-filter/3D'
                />
                <Redirect to='/particle-filter/2D'/>
            </Switch>
        </Suspense>
    );
}

export default Routes;

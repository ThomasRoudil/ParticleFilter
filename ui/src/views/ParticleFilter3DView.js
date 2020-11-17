import React from 'react';
import clsx from 'clsx';
import {Actions, AltitudeChart, Heightmap, ParticleFilter3D, SelectHeightmap} from 'components';
import {Simulation} from 'store/Simulation';

import {Grid} from '@material-ui/core';


function ParticleFilter3DView() {
    const {simulation} = React.useContext(Simulation);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <SelectHeightmap/>
                <div
                    className={clsx({transition: true, hide: !simulation.filename})}
                >
                    {simulation.positions && simulation.positions.length > 0 && <Actions dimensions={3}/>}
                    {simulation.positions && simulation.positions.length > 0 && <AltitudeChart/>}
                </div>

            </Grid>
            <Grid item xs={12} md={8}>
                <div
                    className={clsx({transition: true, hide: !simulation.filename})}
                >
                    <ParticleFilter3D/>
                    <Heightmap/>
                </div>
            </Grid>
        </Grid>
    );
}

export default ParticleFilter3DView;
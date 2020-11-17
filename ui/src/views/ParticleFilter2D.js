import React from 'react';
import clsx from 'clsx';
import {Actions, AltitudeChart, Heightmap, ParticleFilter, SelectHeightmap} from 'components';
import {Simulation} from 'store/Simulation';

import {Grid} from '@material-ui/core';


function ParticleFilter2D() {
    const {simulation} = React.useContext(Simulation);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <SelectHeightmap/>
                <div
                    className={clsx({transition: true, hide: !simulation.filename})}
                >
                    <Heightmap/>
                    {simulation.positions && simulation.positions.length > 0 && <Actions dimensions={2}/>}
                </div>
            </Grid>
            <Grid className={clsx({
                transition: true,
                hide: !simulation.altitude_profile || simulation.altitude_profile.length === 0,
                relative: true
            })} item xs={12} md={8}>
                <AltitudeChart/>
                {simulation.tensor_particles && <ParticleFilter/>}
            </Grid>
        </Grid>
    );
}

export default ParticleFilter2D;
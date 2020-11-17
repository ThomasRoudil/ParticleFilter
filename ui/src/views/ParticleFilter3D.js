import React from 'react';
import clsx from 'clsx';
import {Actions, Heightmap, SelectHeightmap} from 'components';
import {Simulation} from 'store/Simulation';

import {Grid} from '@material-ui/core';


function ParticleFilter3D() {
    const {simulation} = React.useContext(Simulation);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <SelectHeightmap/>
                <div
                    className={clsx({transition: true, hide: !simulation.filename})}
                >
                    <Heightmap/>
                    {simulation.positions && simulation.positions.length > 0 && <Actions/>}
                </div>
            </Grid>
        </Grid>
    );
}

export default ParticleFilter3D;
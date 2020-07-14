import React from 'react';
import {api} from 'api';
import {Title} from 'components';
import {Context} from 'store/Simulation';
import {makeStyles} from '@material-ui/core/styles';
import {Button, Typography} from '@material-ui/core';


const useStyles = makeStyles({
    depositContext: {
        flex: 1,
    },
});

const _getDistance = positions => {
    let clientWidth = document.querySelector('img').clientWidth;
    let clientHeight = document.querySelector('img').clientHeight;
    return (60 / 1081 * Math.sqrt(((positions[1].x - positions[0].x) * 1081 / clientWidth) ** 2 + ((positions[1].y - positions[0].y) * 1081 / clientHeight) ** 2)).toFixed(2);
};

export default function Deposits() {
    const {simulation, setSimulation} = React.useContext(Context);
    const classes = useStyles();
    
    const handleParticleFilter = () => {
        api.post('/particle-filter', {
            altitude_profile: simulation.altitude_profile
        })
            .then(response => {
                setSimulation({
                    ...simulation,
                    tensor_particles: response.data
                })
            })
    };
    
    return (
        <React.Fragment>
            <Title>Trajectory</Title>
            <Typography component='p' variant='h4'>
                {simulation.positions.length > 0 && `${_getDistance(simulation.positions)} km`}
            </Typography>
            <Typography color='textSecondary' className={classes.depositContext}>
                real distance
            </Typography>
            <Button 
                variant='contained' 
                color='secondary'
                disabled={!simulation.filename || simulation.positions.length === 0}
                onClick={handleParticleFilter}
            >
                Compute particle filter
            </Button>
        </React.Fragment>
    );
}
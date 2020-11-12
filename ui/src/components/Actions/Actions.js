import React, {useEffect, useState} from 'react';
import {api} from 'api';
import {Title} from 'components';
import {useLoading} from 'hooks';
import {Simulation} from 'store/Simulation';
import {makeStyles} from '@material-ui/core/styles';
import {Button, Grid, MenuItem, Select, Slider, Typography} from '@material-ui/core';

const useStyles = makeStyles({
    flex: {
        flex: 1,
    },
});

const _getDistance = positions => {
    if (!document.querySelector('img')) return null;
    if (!positions || positions.length === 0) return null;
    let clientWidth = document.querySelector('img').clientWidth;
    let clientHeight = document.querySelector('img').clientHeight;
    return (60 / 1081 * Math.sqrt(((positions[1].x - positions[0].x) * 1081 / clientWidth) ** 2 + ((positions[1].y - positions[0].y) * 1081 / clientHeight) ** 2)).toFixed(2);
};

export default function Actions() {
    const {simulation, setSimulation} = React.useContext(Simulation);
    const classes = useStyles();

    const {setLoading} = useLoading();

    const [count, setCount] = useState(200);
    const [method, setMethod] = useState('normal');

    const handlePfilter = () => {
        setLoading(true)
        api.post('/particle-filter', {
            altitude_profile: simulation.altitude_profile,
            particles_count: count,
            resampling_method: method
        })
            .then(response => {
                setSimulation({
                    ...simulation,
                    tensor_particles: response.data
                })
            })
            .finally(() => setLoading(false))
    };

    const [distance, setDistance] = useState(simulation.positions
        ? _getDistance(simulation.positions)
        : 0
    );
    useEffect(() => {
        setDistance(_getDistance(simulation.positions))
    }, [setDistance, _getDistance, simulation.positions])

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Title>Trajectory</Title>
                <Typography component='p' variant='h4'>
                    {simulation.positions.length > 0 && `${distance} km`}
                </Typography>
                <Typography color='textSecondary' className={classes.flex}>
                    real distance
                </Typography>

            </Grid>
            <Grid item xs={12}>
                <Typography color='textPrimary'>
                    Particles :&nbsp;
                    <Typography
                        component='span'
                        style={{fontWeight: 'bold'}}
                    >
                        {count}
                    </Typography>
                </Typography>
                <Slider
                    defaultValue={200}
                    valueLabelDisplay="auto"
                    step={50}
                    marks
                    min={50}
                    max={1000}
                    onChange={(event, value) => setCount(value)}
                />
                <Typography color='textPrimary'>
                    Resampling :&nbsp;
                    <Typography
                        component='span'
                        style={{fontWeight: 'bold'}}
                    >
                        {method}
                    </Typography>
                </Typography>
                <Select
                    label={method}
                    value={method}
                    onChange={event => setMethod(event.target.value)}
                    small
                    variant='outlined'
                >
                    {['normal', 'multinomial'].map(method => (
                        <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                </Select>

            </Grid>
            <Grid item xs={12}>
                <Button
                    variant='contained'
                    color='secondary'
                    disabled={!simulation.filename || simulation.positions.length === 0}
                    onClick={handlePfilter}
                >
                    Compute particle filter
                </Button>
            </Grid>
        </Grid>
    );
}
import React from 'react';
import {Title} from 'components';
import {Context} from 'store/Simulation';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Slider} from '@material-ui/core';
import {ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis} from 'recharts';


const useStyles = makeStyles({
    root: {}
});


const ParticlesChart = props => {
    const {current, data, max} = props;
    const {simulation} = React.useContext(Context);
    const theme = useTheme();

    return (
        <ResponsiveContainer>
            <ScatterChart
                margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <XAxis type='number' dataKey='x' domain={[-max, max]} hide/>
                <YAxis stroke={theme.palette.text.secondary} type='number' dataKey='y'/>
                <Scatter
                    data={simulation.particle_filters[current] && simulation.particle_filters[current].particles[data]
                        .filter(value => value < max)
                        .filter(value => value > -max)
                        .map(value => {
                            return {
                                x: value,
                                y: Math.random() * 50
                            }
                        })}
                    fill='#8884d8'
                />
            </ScatterChart>
        </ResponsiveContainer>
    )
}


export default function ParticleFilter() {
    const {simulation} = React.useContext(Context);
    const classes = useStyles();

    const [current, setCurrent] = React.useState(0);
    const handleDisplayParticles = (event, value) => {
        setCurrent(value)
    };

    return (
        <React.Fragment>
            <Title>Particle filter</Title>
            <ParticlesChart
                current={current}
                data='alt'
                max={50000}
            />
            <ParticlesChart
                current={current}
                data='d_alt'
                max={20000}
            />
            <ParticlesChart
                current={current}
                data='dd_alt'
                max={100}
            />
            <ParticlesChart
                current={current}
                data='radar_state'
                max={2}
            />
            <Slider
                defaultValue={0}
                onChange={handleDisplayParticles}
                step={1}
                marks
                min={0}
                max={500}
                disabled={!simulation.particle_filters || simulation.particle_filters.length === 0}
            />
        </React.Fragment>
    );
}
import React from 'react';
import {Title} from 'components';
import {Simulation} from 'store/Simulation';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Slider} from '@material-ui/core';
import {ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis} from 'recharts';

const useStyles = makeStyles({
    canvas: {
        position: 'absolute',
        width: '100%',
        height: '816px !important',
        bottom: 0,
        left: 0,
        zIndex: 999
    },
    absolute: {
        position: 'absolute',
        width: '100%',
        height: '816px !important',
        top: 0,
        left: 0,
        zIndex: 999
    }
});

export default function ParticleFilter3D() {
    const {simulation} = React.useContext(Simulation);

    const classes = useStyles();
    const theme = useTheme();


    const [current, setCurrent] = React.useState(0);
    const handleDisplayParticles = (event, value) => {
        setCurrent(value)
    };


    return (
        <>
            <Title>Particle filter 3D</Title>
            <Slider
                defaultValue={0}
                onChange={handleDisplayParticles}
                step={1}
                marks
                min={0}
                max={500}
                disabled={!simulation.tensor_particles || simulation.tensor_particles.length === 0}
            />
            <div className='relative'>
                <ResponsiveContainer
                    className={classes.absolute}
                >
                    <ScatterChart
                        width='100%'
                    >
                        <XAxis stroke={theme.palette.text.secondary} type="number" dataKey="x" height={0}
                               domain={[0, 1081]}/>
                        <YAxis stroke={theme.palette.text.secondary} type="number" dataKey="y" width={0}
                               domain={[0, 1081]}/>
                        <ZAxis range={[20]}/>
                        <Scatter
                            data={simulation.tensor_particles[current] && simulation.tensor_particles[current].map(particle => {
                                return {
                                    x: particle[0],
                                    y: particle[1]
                                }
                            }).slice(0, 500)}
                            fill="#c51162"
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}
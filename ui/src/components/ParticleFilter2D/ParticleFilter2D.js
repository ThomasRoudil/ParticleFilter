import React from 'react';
import {Title} from 'components';
import {Simulation} from 'store/Simulation';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Slider} from '@material-ui/core';
import {ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis, ZAxis} from 'recharts';

const useStyles = makeStyles({
    absolute: {
        position: 'absolute',
        width: '100%',
        top: 50
    }
});


function getStandardDeviation(array) {  // how particles are far from each other
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function getAverageDeviation(array, index) {  // how particles are far from the plane
    return array.filter(particle => particle <= index + 2 && particle >= index - 2).length
}

export default function ParticleFilter2D() {
    const {simulation} = React.useContext(Simulation);

    const classes = useStyles();
    const theme = useTheme();

    const [current, setCurrent] = React.useState(0);
    const handleDisplayParticles = (event, value) => {
        setCurrent(value)
    };

    return (
        <React.Fragment>
            <Title>Particle filter</Title>

            <ResponsiveContainer
                className={classes.absolute}
                width='100%'
                height={300}
            >
                <ComposedChart
                    width='100%'
                >
                    <XAxis stroke={theme.palette.text.secondary} type="number" dataKey="x" height={0}
                           domain={[0, 500]}/>
                    <YAxis stroke={theme.palette.text.secondary} type="number" dataKey="y" width={0}/>
                    <ZAxis range={[8]}/>
                    <Scatter
                        data={simulation.tensor_particles[current] && simulation.tensor_particles[current].map(value => {
                            return {
                                x: value,
                                y: Math.random()
                            }
                        })}
                        fill="#c51162"
                    />
                    <ReferenceLine x={current - 2} stroke="red" strokeDasharray="3 3"/>
                    <ReferenceLine x={current} stroke="red"/>
                    <ReferenceLine x={current + 2} stroke="red" strokeDasharray="3 3"/>
                </ComposedChart>
            </ResponsiveContainer>
            <Slider
                defaultValue={0}
                onChange={handleDisplayParticles}
                step={1}
                marks
                min={0}
                max={500}
                disabled={!simulation.tensor_particles || simulation.tensor_particles.length === 0}
            />

            <Title>Metrics</Title>
            <ResponsiveContainer
                width='100%'
                height={300}
            >
                <ComposedChart
                    data={simulation.tensor_particles.map((particles, index) => ({
                        index,
                        deviation: getStandardDeviation(particles),
                        result: getAverageDeviation(particles, index)
                    }))}
                    width='100%'
                >
                    <XAxis stroke={theme.palette.text.secondary}/>
                    <YAxis stroke={theme.palette.text.secondary} width={0}/>
                    <Line type="monotone" dataKey="deviation" stroke='#fb8c00' dot={false}/>
                    <Line type="monotone" dataKey="result" stroke="#00c853" dot={false}/>
                    <Tooltip/>
                </ComposedChart>
            </ResponsiveContainer>

        </React.Fragment>
    );
}
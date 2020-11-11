import React from 'react';
import {Title} from 'components';
import {Context} from 'store/Simulation';
import {useTheme} from '@material-ui/core/styles';
import {Slider} from '@material-ui/core';
import {ComposedChart, Line, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis} from 'recharts';

function getStandardDeviation(array) {  // how particles are far from each other
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function getAverageDeviation(array, index) {  // how particles are far from the plane
    return array.filter(particle => particle <= index + 10 && particle >= index - 10).length
}

export default function ParticleFilter() {
    const {simulation} = React.useContext(Context);
    const theme = useTheme();

    const [current, setCurrent] = React.useState(0);
    const handleDisplayParticles = (event, value) => {
        setCurrent(value)
    };

    return (
        <React.Fragment>
            <Title>Particle filter</Title>

            <ResponsiveContainer
                height={150}
            >
                <ScatterChart>
                    <XAxis stroke={theme.palette.text.secondary} type="number" dataKey="x" domain={[0, 500]}/>
                    <YAxis stroke={theme.palette.text.secondary} type="number" dataKey="y" width={0}/>
                    <Scatter
                        data={simulation.tensor_particles[current] && simulation.tensor_particles[current].map(value => {
                            return {
                                x: value,
                                y: 100 + Math.random() * 100
                            }
                        })}
                        fill="#8884d8"
                    />
                    <Scatter
                        data={[{
                            x: current,
                            y: 0
                        }]}
                        fill="#ff0000"
                    />
                </ScatterChart>
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

            <ResponsiveContainer
                height={300}
            >
                <ComposedChart
                    data={simulation.tensor_particles.map((particles, index) => ({
                        index,
                        deviation: getStandardDeviation(particles),
                        result: getAverageDeviation(particles, index)
                    }))}
                >
                    <XAxis stroke={theme.palette.text.secondary}/>
                    <YAxis stroke={theme.palette.text.secondary} width={40}/>
                    <Line type="monotone" dataKey="deviation" stroke={theme.palette.primary.main} dot={false}/>
                    <Line type="monotone" dataKey="result" stroke="#82ca9d" dot={false}/>
                    <Tooltip/>
                </ComposedChart>
            </ResponsiveContainer>

        </React.Fragment>
    );
}
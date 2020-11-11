import React from 'react';
import {Title} from 'components';
import {Context} from 'store/Simulation';
import {useTheme} from '@material-ui/core/styles';
import {Slider} from '@material-ui/core';
import {ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis} from 'recharts';



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
            <ResponsiveContainer>
                <ScatterChart
                    width={400}
                    height={400}
                    margin={{
                        top: 20, right: 20, bottom: 20, left: 20,
                    }}
                >
                    <XAxis stroke={theme.palette.text.secondary} type="number" dataKey="x" domain={[0, 500]} />
                    <YAxis stroke={theme.palette.text.secondary} type="number" dataKey="y"/>
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
        </React.Fragment>
    );
}
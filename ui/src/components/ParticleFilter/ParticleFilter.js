import React from 'react';
import {Title} from 'components';
import {Context} from 'store/Simulation';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Slider} from '@material-ui/core';
import {ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis} from 'recharts';


const useStyles = makeStyles({
    root: {}
});


export default function ParticleFilter() {
    const {simulation, setSimulation} = React.useContext(Context);
    const classes = useStyles();
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
                    <XAxis stroke={theme.palette.text.secondary} type='number' dataKey='x' domain={[-30000, 30000]}/>
                    <YAxis stroke={theme.palette.text.secondary} type='number' dataKey='y'/>
                    <Scatter
                        data={simulation.particle_filters[current] && simulation.particle_filters[current]
                            .filter(value => value < 30000)
                            .filter(value => value > -30000)
                            .map(value => {
                                return {
                                    x: value,
                                    y: 100 + Math.random() * 100
                                }
                            })}
                        fill='#8884d8'
                    />
                    <Scatter
                        data={[{
                            x: current,
                            y: 0
                        }]}
                        fill='#ff0000'
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
                disabled={!simulation.particle_filters || simulation.particle_filters.length === 0}
            />
        </React.Fragment>
    );
}
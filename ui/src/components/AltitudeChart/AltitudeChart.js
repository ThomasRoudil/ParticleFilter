import React from 'react';
import {Context} from "store/Simulation";
import {useTheme} from '@material-ui/core/styles';
import {LineChart, Line, Scatter, ScatterChart, XAxis, YAxis, Label, ResponsiveContainer} from 'recharts';
import {Slider} from "@material-ui/core";
import Title from '../Title/Title';

// Generate Sales Data
function createData(time, amount) {
    return {time, amount};
}

export default function AltitudeChart() {
    const {simulation} = React.useContext(Context);
    const theme = useTheme();

    const [current, setCurrent] = React.useState(0);
    const handleDisplayParticles = (event, value) => {
        setCurrent(value)
    };

    if (!simulation.altitude_profile) return null;

    return (
        <React.Fragment>
            <Title>Altitude profile</Title>
            <ResponsiveContainer>
                <LineChart
                    data={simulation.altitude_profile.map((altitude, index) => createData(index, altitude))}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <XAxis stroke={theme.palette.text.secondary}/>
                    <YAxis stroke={theme.palette.text.secondary}>
                        <Label
                            angle={270}
                            position="left"
                            style={{textAnchor: 'middle', fill: theme.palette.text.primary}}
                        >
                            Altitude (m)
                        </Label>
                    </YAxis>
                    <Line type="monotone" dataKey="amount" stroke={theme.palette.primary.main} dot={false}/>
                </LineChart>
            </ResponsiveContainer>
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
import React from 'react';
import {Context} from "store/Simulation";
import {useTheme} from '@material-ui/core/styles';
import {LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer} from 'recharts';
import Title from '../Title/Title';

// Generate Sales Data
function createData(time, amount) {
    return {time, amount};
}

export default function AltitudeChart() {
    const {simulation} = React.useContext(Context);
    const theme = useTheme();

    if (!simulation.altitude) return null;

    return (
        <React.Fragment>
            <Title>Altitude profile</Title>
            <ResponsiveContainer>
                <LineChart
                    data={simulation.altitude.map((altitude, index) => createData(index, altitude))}
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
        </React.Fragment>
    );
}
import React from 'react';
import {Context} from 'store/Simulation';
import {Title} from 'components';
import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useTheme} from '@material-ui/core/styles';

function createData(time, altitude) {
    return {time, altitude};
}

export default function AltitudeChart() {
    const {simulation} = React.useContext(Context);
    const theme = useTheme();

    if (!simulation.altitude_profile) return null;

    return (
        <React.Fragment>
            <Title>Altitude profile</Title>
            <ResponsiveContainer>
                <LineChart
                    data={simulation.altitude_profile.map((altitude, index) => createData(index, altitude))}
                >
                    <XAxis stroke={theme.palette.text.secondary} width={40}/>
                    <YAxis stroke={theme.palette.text.secondary}/>
                    <Line type="monotone" dataKey="altitude" stroke={theme.palette.primary.main} dot={false}/>
                    <Tooltip/>
                </LineChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
}
import React from 'react';
import {api} from 'api';
import {Context} from "store/Heightmap";
import {FormControl, InputLabel, MenuItem, Select} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginBottom: theme.spacing(1),
        minWidth: 120,
        maxWidth: 200
    }
}));

function SelectHeightmap() {
    const {heightmap, setHeightmap} = React.useContext(Context);
    const classes = useStyles();

    const [heightmaps, setHeightmaps] = React.useState([]);
    React.useEffect(() => {
        api.get('/heightmaps')
            .then(response => setHeightmaps(response.data))
    }, []);

    const handleChange = (event) => {
        setHeightmap(event.target.value)
        setHeightmap(event.target.value);
    };

    return (
        <FormControl className={classes.formControl} variant="outlined">
            <InputLabel>Heightmap</InputLabel>
            <Select
                label='heightmap'
                value={heightmap}
                onChange={handleChange}
            >
                {heightmaps.map(filename => (
                    <MenuItem key={filename} value={filename}>{filename}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default SelectHeightmap;
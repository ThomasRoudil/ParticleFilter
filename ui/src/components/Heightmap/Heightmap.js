import React from 'react';
import {Context} from "store/Heightmap";
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    img: {
        width: '100%',
        userSelect: 'none'
    }
}));

function Heightmap() {
    const {heightmap} = React.useContext(Context);
    const classes = useStyles();

    if (!heightmap) return null;

    return (
        <img
            className={classes.img}
            onDragStart={event => event.preventDefault()}
            src={`http://localhost:9000/get-heightmap/${heightmap}`}
        />
    )
}

export default Heightmap;
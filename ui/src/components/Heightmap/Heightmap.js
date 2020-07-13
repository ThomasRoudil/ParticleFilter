import React from 'react';
import {api} from 'api';
import {Context} from "store/Simulation";
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'relative'
    },
    img: {
        width: '100%',
        userSelect: 'none'
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'crosshair',
        zIndex: 1000
    }
}));

function _reset(canvas) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function _resize(canvas, img) {
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
}

function _getOffset(event) {
    event = event.nativeEvent;

    if (event.layerX || event.layerX === 0) { // Firefox
        event._x = event.layerX;
        event._y = event.layerY;
    } else if (event.offsetX || event.offsetX === 0) { // Chrome & Opera
        event._x = event.offsetX;
        event._y = event.offsetY;
    }
    return {'x': event._x, 'y': event._y};
}

function _drawCursor(canvas, offset) {
    if (offset.x > 0 && offset.y > 0 && offset.x < canvas.width && offset.y < canvas.height) {
        let context = canvas.getContext('2d');
        context.setLineDash([5]);
        context.strokeStyle = '#dddddd';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(-1000, offset.y);
        context.lineTo(1000, offset.y);
        context.moveTo(offset.x, 0);
        context.lineTo(offset.x, 1000);
        context.stroke();
    }
}

function _drawLine(canvas, p1, p2, color) {
    let context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.beginPath();
    context.setLineDash([5, 7]);
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
    context.font = "14px serif";
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.fillText(`${p1.x}  ${p1.y}`, p1.x, p2.y > p1.y ? p1.y : p1.y + 14);
    context.fillText(`${p2.x}  ${p2.y}`, p2.x, p2.y > p1.y ? p2.y + 14 : p2.y);
}

function Heightmap() {
    const {simulation, setSimulation} = React.useContext(Context);
    const classes = useStyles();

    const canvasRef = React.useRef();
    const imageRef = React.useRef();

    let p1, p2;

    if (!simulation.filename) return null;

    const handleMouseDown = event => {
        if (!p1) {
            p1 = _getOffset(event);
        }
    };

    const handleMouseMove = event => {
        let canvas = canvasRef.current;
        let img = imageRef.current;
        _resize(canvas, img);
        if (p1) {
            p2 = _getOffset(event);
            _drawLine(canvas, p1, p2, "#6bb3db");
        } else {
            _drawCursor(canvas, _getOffset(event))

            if (simulation.positions.length > 0) {
                _drawLine(canvas, simulation.positions[0], simulation.positions[1], "#6bb3db");
            }
        }
    };

    const handleMouseUp = event => {
        if (!p1 || !p2) return;

        let img = imageRef.current;
        let positions = [
            {
                x: parseInt(p1.x * 1081 / img.clientWidth),
                y: parseInt(p1.y * 1081 / img.clientHeight)
            },
            {
                x: parseInt(p2.x * 1081 / img.clientWidth),
                y: parseInt(p2.y * 1081 / img.clientHeight)
            }
        ];
        api.post('/altitude-profile', {
            filename: simulation.filename,
            positions: positions
        })
            .then(response => {
                    setSimulation({
                        ...simulation,
                        altitude_profile: response.data,
                        positions: [p1, p2]
                    });
                    p1 = null;
                }
            );
    };

    const handleMouseLeave = () => {
        let canvas = canvasRef.current;
        _reset(canvas);
        if (p1) {
        }

        else if (simulation.positions.length > 0) {
            _drawLine(canvas, simulation.positions[0], simulation.positions[1], "#6bb3db");
        }
    };

    return (
        <div className={classes.root}>
            <img
                className={classes.img}
                ref={imageRef}
                onDragStart={event => event.preventDefault()}
                src={`http://localhost:9000/get-heightmap/${simulation.filename}`}
                alt='Heightmap'
            />
            <canvas
                className={classes.canvas}
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            />
        </div>
    )
}

export default Heightmap;
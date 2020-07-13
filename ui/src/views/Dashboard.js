import React from 'react';
import clsx from 'clsx';
import {Context} from "store/Simulation";
import {FreeCamera, Color3, Vector3, HemisphericLight, MeshBuilder} from '@babylonjs/core';
import {AltitudeChart, Deposits, Heightmap, Scene, SelectHeightmap} from 'components';
import {mainListItems} from './listItems';

import {
    AppBar,
    Box,
    Container,
    CssBaseline,
    Divider,
    Drawer,
    Grid,
    IconButton,
    Link,
    List,
    Paper,
    Toolbar,
    Typography
} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://github.com/EL3PHANT/ParticleFilter">
                Neural Particle Filter
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },
}));

let box;
let camera;

const onSceneReady = scene => {
    scene.clearColor = new Color3(1, 1, 1);

    camera = new FreeCamera("camera", new Vector3(0, 500, 0), scene);
    camera.setTarget(Vector3.Zero());
    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("light", new Vector3(-1, 0, -1), scene);
    light.intensity = 0.7;
};

/**
 * Will run on every frame render.
 */
const onRender = scene => {
    if (box !== undefined) {
        const deltaTimeInMillis = scene.getEngine().getDeltaTime();

        const rpm = 10;
        box.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000));
    }
};


export default function Dashboard() {
    const {simulation} = React.useContext(Context);
    const classes = useStyles();

    const [sceneState, setSceneState] = React.useState();
    const [ground, setGround] = React.useState('');
    React.useEffect(() => {
        if (ground) {
            ground.isVisible = false;
        }
        setTimeout(() => setGround(MeshBuilder.CreateGroundFromHeightMap("ground", "http://localhost:9000/get-heightmap/" + simulation.filename, {
            width: 1081,
            height: 1081,
            subdivisions: 1200,
            minHeight: 0,
            maxHeight: 120
        })), 50)
    }, [simulation.filename]);

    React.useEffect(() => {
        if (simulation.positions && simulation.positions.length > 0) {

            // Compute babylon space location
            let clientWidth = document.querySelector('img').clientWidth;
            let clientHeight = document.querySelector('img').clientHeight;
            let spaceP1X = 1081 * (simulation.positions[0].x / clientWidth - 0.5);
            let spaceP1Y = - 1081 * (simulation.positions[0].y / clientHeight - 0.5);
            let spaceP2X = 1081 * (simulation.positions[1].x / clientWidth - 0.5);
            let spaceP2Y = - 1081 * (simulation.positions[1].y / clientHeight - 0.5);

            // Move camera
            camera.position = new Vector3(spaceP1X, 150, spaceP1Y);
            let target = new Vector3(spaceP2X, 150, spaceP2Y);
            camera.setTarget(target);

            // Draw trajectory line
            let points = [
                new Vector3(spaceP1X, 90, spaceP1Y),
                new Vector3(spaceP2X, 90, spaceP2Y),
            ];
            let lines = MeshBuilder.CreateDashedLines("lines", {points: points}, sceneState);
            lines.color = Color3.FromHexString('#6bb3db')
        }
    }, [simulation.positions]);


    const [open, setOpen] = React.useState(false);
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    return (
        <div className={classes.root}>
            <CssBaseline/>

            <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                        Neural Particle Filter (NPF)
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                classes={{
                    paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                }}
                open={open}
            >
                <div className={classes.toolbarIcon}>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon/>
                    </IconButton>
                </div>
                <Divider/>
                <List>{mainListItems}</List>
                <Divider/>
            </Drawer>

            <main className={classes.content}>
                <div className={classes.appBarSpacer}/>
                <Container maxWidth="lg" className={classes.container}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper className={classes.paper}>
                                <SelectHeightmap/>
                                <Heightmap/>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper className={classes.paper}>
                                <Scene
                                    antialias
                                    onSceneReady={scene => {
                                        setSceneState(scene);
                                        onSceneReady(scene, simulation.filename)
                                    }}
                                    onRender={onRender}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={fixedHeightPaper}>
                                <AltitudeChart/>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4} lg={3}>
                            <Paper className={fixedHeightPaper}>
                                <Deposits/>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Box pt={4}>
                        <Copyright/>
                    </Box>
                </Container>
            </main>
        </div>
    );
}
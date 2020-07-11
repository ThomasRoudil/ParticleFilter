import React from 'react';
import {ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
import {Dashboard as DashboardIcon} from '@material-ui/icons';

export const mainListItems = (
    <div>
        <ListItem button>
            <ListItemIcon>
                <DashboardIcon/>
            </ListItemIcon>
            <ListItemText primary="Dashboard"/>
        </ListItem>
    </div>
);

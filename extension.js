import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Panel from 'resource:///org/gnome/shell/ui/panel.js';
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import MultiMonitorPanel from './panel.js';
var TopBars = [];


export default class MultiMonitorTopBarExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        console.log(`EXTENSIONLOG => STARTING EXTENSION ${this.uuid}`);
        this.mainBox = Main.layoutManager.panelBox;
        this.mainPanel = Main.panel;
        this._themeChangedId = 0;
        this.Containers = [];
        this.monitors = Main.layoutManager.monitors;
        this.style = {};
    }

    enable() {
        this._createTopBars();
        this._themeChangedId = this.mainPanel.connect('style-changed', this._onThemeChange.bind(this));
    }

    disable(reset = false) {
        this._destroyTopBars();
    }

    _styleChange(newStyle) {
        const keys1 = Object.keys(this.style);
        const keys2 = Object.keys(newStyle || {});
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (let key of keys1) {
            if (this.style[key] !== newStyle[key]) {
                return false;
            }
        }
        return true;
    }

    _onThemeChange(panel) {
        this.mainPanel = panel;
        let newStyle = this.mainPanel.get_style();
        log('EXTENSIONLOG => NEW STYLE: '+newStyle);
        if(this._styleChange(newStyle)){
            log('EXTENSIONLOG => THEME NOT CHANGED: ', this.style);
        } else {
            this.style = newStyle;
            log('EXTENSIONLOG => THEME CHANGED: ', this.style);
            this._destroyTopBars();
            this._createTopBars();
        }

    }

    _destroyTopBars() {
        for (let container of this.Containers) {
            container.remove_child(container.get_children()[0]);
            Main.layoutManager.removeChrome(container);
            container.destroy();
        }
        this.mainPanel.disconnect(this._themeChangedId);
        this.Containers = [];
    }

    _createTopBars() {
        log('EXTENSIONLOG => CREATING '+(this.monitors.length - 1)+' TOP BARS');
        let primaryMonitorIndex = Main.layoutManager.primaryMonitor.index;

        for (let i = 0; i <= this.monitors.length - 1; i++) {
            if (i === primaryMonitorIndex) { continue; }
            log('EXTENSIONLOG => CREATING TOP BAR FOR MONITOR '+i);
            let monitor = this.monitors[i];
            let container = new MultiMonitorPanel(monitor, this.mainBox, this.mainPanel);
            this.Containers.push(container._get_container());
        }
    }

}
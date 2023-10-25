import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Panel from 'resource:///org/gnome/shell/ui/panel.js';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

export default class MultiMonitorPanel {
    constructor(monitor, mainBox, mainPanel) {
        this.monitor = monitor;
        this.mainBox = mainBox;
        this.mainPanel = mainPanel;

        let mainPanelStyle = this.mainPanel.get_style();
        let mainBoxStyle = this.mainBox.get_style();


        this.container = new Clutter.Actor();
        this.container.style = mainBoxStyle;
        this.container.width = this.monitor.width;
        this.container.height = this.mainBox.get_height();
        this.container.visible = true;
        this.container.set_position(this.monitor.x, this.monitor.y);

        this.topBar = new Panel.Panel({}, this.monitor, {}, true);

        this.topBar.width = this.monitor.width - 20;
        this.topBar.style = mainPanelStyle;
        this.topBar.visible = true;
        this.topBar.height = this.mainPanel.get_height() - 5;


        if (this.monitor.inFullscreen) {
            this.topBar.hide();
        }
        let children = this.mainPanel.get_children();
        children.forEach(child => {
            let clone = new Clutter.Clone({source: child});
            this.topBar.add_child(clone);
        });
        this.mainBox.remove_child(this.topBar);
        this.container.add_child(this.topBar);
        Main.layoutManager.addChrome(this.container, { affectsInputRegion: true, affectsStruts: true });
    }
    _get_container(){
        return this.container;
    }
}
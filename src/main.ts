import { Plugin, App } from 'obsidian';
import { NavigatorPluginSettings, 
         NavigatorPluginSettingTab } from './settings';
import Navigator from './navigator';


const DEFAULT_SETTINGS: NavigatorPluginSettings = {
    scrollSpeed: 100, // default scroll speed
};


export default class NavigatorPlugin extends Plugin {
    settings: NavigatorPluginSettings;
    private navigatorManager: Navigator;


    async onload() {
        await this.loadSettings();
        this.addSettingTab(new NavigatorPluginSettingTab(this.app, this));
        this.navigatorManager = new Navigator(this.app, this.settings);
        this.navigatorManager.startManager(this);
    }


    onunload() {
        this.saveData(this.settings);
        this.navigatorManager.stopManager();
    }


    private async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
}

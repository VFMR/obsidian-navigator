import { Plugin, App } from 'obsidian';
import { NavigatorPluginSettings, 
         NavigatorPluginSettingTab } from './settings';
import NavigatorManager from './manager';


const DEFAULT_SETTINGS: NavigatorPluginSettings = {
    scrollSpeed: 100, // default scroll speed
};


export default class NavigatorPlugin extends Plugin {
    settings: NavigatorPluginSettings;
    private navigatorManager: NavigatorManager;


    async onload() {
        await this.loadSettings();
        this.addSettingTab(new NavigatorPluginSettingTab(this.app, this));
        this.navigatorManager = new NavigatorManager(this.app, this.settings);
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

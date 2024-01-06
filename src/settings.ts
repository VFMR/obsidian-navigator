import { PluginSettingTab,
         App,
         Modal,
         Notice,
         Setting } from 'obsidian';
import NavigatorPlugin from './main';


export interface NavigatorPluginSettings {
    scrollSpeed: number;
}


export class NavigatorPluginSettingTab extends PluginSettingTab {
  plugin: NavigatorPlugin;

  constructor(app: App, plugin: NavigatorPlugin) {
      super(app, plugin);
      this.plugin = plugin;
  }
  display() {
      const { containerEl } = this;

      containerEl.empty();

      // Create a span element to display the current scroll speed
      const scrollSpeedDisplay = containerEl.createEl('span', {
          text: `Current scroll speed: ${this.plugin.settings.scrollSpeed}`
      });

      new Setting(containerEl)
          .setName('Scroll Speed')
          .setDesc('Adjust the scroll speed for j/k keys')
          .addSlider(slider => 
              slider.setLimits(10, 500, 10)
                    .setValue(this.plugin.settings.scrollSpeed)
                    .onChange(async (value) => {
                        this.plugin.settings.scrollSpeed = value;
                        await this.plugin.saveData(this.plugin.settings);

                        // Update the display text when the slider value changes
                        scrollSpeedDisplay.setText(`Current scroll speed: ${value}`);
                    }));
  }

}


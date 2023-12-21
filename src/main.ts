import { Plugin, 
         PluginSettingTab,
         App,
         Editor,
         MarkdownView,
         Modal,
         Notice,
         Setting } from 'obsidian';

interface NavigatorPluginSettings {
    scrollSpeed: number;
}

const DEFAULT_SETTINGS: NavigatorPluginSettings = {
    scrollSpeed: 100, // default scroll speed
};

export default class NavigatorPlugin extends Plugin {
    settings: NavigatorPluginSettings;
    private isInLinkSelectionMode: boolean = false;
    private scrollableClassName: string = 'markdown-preview-view markdown-rendered node-insert-event is-readable-line-width allow-fold-headings show-indentation-guide allow-fold-lists show-properties'

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new NavigatorPluginSettingTab(this.app, this));

        this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            this.handleKeyPress(evt);
        });

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                this.leaveLinkSelectionMode();
            })
        );
    }

    onunload() {
        this.saveData(this.settings);
    }

    private async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    private handleKeyPress(evt: KeyboardEvent) {
        if (!this.isInReadMode()) {
            return;
        }

        switch (evt.key) {
            case 'j':
              this.scrollDown();
              break;
             case 'k':
              this.scrollUp();
              break;
             case 'h':
              this.scrollUp();
              break;
             case 'l':
              this.scrollUp();
              break;
            case 'f':
              this.enterLinkSelectionMode();
              break;
        }
    }


    private scroll(xSpeed: number, ySpeed: number) {
      const activeLeaf = this.app.workspace.activeLeaf;
      const activeElement = activeLeaf?.view.containerEl;
      const activeScrollableElement = activeElement.querySelector('.markdown-preview-view.markdown-rendered.node-insert-event.is-readable-line-width.allow-fold-headings.show-indentation-guide.allow-fold-lists.show-properties');
      if (activeElement) {
        activeScrollableElement.scrollBy(xSpeed, ySpeed);
      }
    }


    private scrollDown() {
      this.scroll(0, this.settings.scrollSpeed)
    }


    private scrollUp() {
      this.scroll(0, -this.settings.scrollSpeed)
    }


    private scrollLeft() {
      this.scroll(this.settings.scrollSpeed, 0)
    }


    private scrollRight() {
      this.scroll(-this.settings.scrollSpeed, 0)
    }

        
    private isInReadMode(): boolean {
        const activeLeaf = this.app.workspace.activeLeaf;
        return activeLeaf?.view.getViewType() === 'markdown'; // && !activeLeaf.view.getState().mode;
    }


    private removeOverlays() {
        document.querySelectorAll('.link-overlay').forEach(el => el.remove());
    }


    private leaveLinkSelectionMode() {
        this.removeOverlays();
        this.isInLinkSelectionMode = false;
    }


  private enterLinkSelectionMode() {
          if (!this.isInReadMode()) {
                return;
            }

          this.isInLinkSelectionMode = true;
    
      let links = Array.from(document.querySelectorAll('a'));
      const filteredLinks = links.filter(link => 
        link.classList.contains('internal-link') || link.classList.contains('external-link')
      ); 

      const linkMap = new Map<number, HTMLAnchorElement>();
      let input = '';

      const updateOverlays = () => {
        if (this.isInLinkSelectionMode) {
          removeOverlays();

          filteredLinks.forEach((link, index) => {
              if (link.textContent.toLowerCase().includes(input.toLowerCase())) {
              const overlay = document.createElement('div');

              overlay.classList.add('link-overlay');
              overlay.classList.add('vimium-like-link-overlay');

              overlay.textContent = (index + 1).toString();
              overlay.style.position = 'absolute';
              overlay.style.backgroundColor = 'yellow';
              overlay.style.color = 'black';
              //
              document.body.appendChild(overlay);
              const rect = link.getBoundingClientRect();

              overlay.style.left = `${rect.left}px`;
              overlay.style.top = `${rect.top}px`;

              linkMap.set(index + 1, link);
              }
          });
        }
      };

      const removeOverlays = () => {this.removeOverlays();}

      updateOverlays(); // Initial call to display all links

      // Listen for keypresses for filtering and navigation
      const keydownListener = (evt: KeyboardEvent) => {
        if (evt.key === 'Escape') {
          this.leaveLinkSelectionMode();
        } else if (evt.key.length === 1 && /[0-9]/.test(evt.key)) { // check if the key is a number
          const key = parseInt(evt.key, 10);
          if (linkMap.has(key)) {
            const link = linkMap.get(key);
            link?.click();
            this.leaveLinkSelectionMode();
            document.removeEventListener('keydown', keydownListener);
          }
        }
      };

      // event listeners only active in link selection mode
      if (this.isInLinkSelectionMode) {
        document.addEventListener('keydown', keydownListener);

        window.addEventListener('scroll', (event) => {
          if (event.target.className === this.scrollableClassName) {
              updateOverlays();
          }
        }, true); // The 'true' here sets the listener to capture the event during the capturing phase
      } else {
        document.removeEventListener('keydown', keydownListener);
      }
    }
}

class NavigatorPluginSettingTab extends PluginSettingTab {
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


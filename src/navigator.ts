import { TFile, debounce } from 'obsidian';
import NavigatorScroll  from './scroll';
import NavigatorPluginSettings from './settings'
import LinkFilter from './links'
import Overlay from './overlays'


export default class Navigator {
    constructor(private app: App, private settings: NavigatorPluginSettings) {
        this.app = app;
        this.settings = settings;
    }

    private isInLinkSelectionMode: boolean = false;
    private openInNewTab: boolean = false;
    private scroller: NavigatorScroll = new NavigatorScroll(this.app, this.settings);
    private linkFilter: LinkFilter = new LinkFilter(this.app);
    private overlays: Overlay[] = [];
    private linkSelectionInput: string = '';


    startNavigator(plugin) {
      this.linkFilter.createFilterDisplayBox();

      // plugin.registerDomEvent(window, 'scroll', this.throttle(this.myFunction, 200));

      plugin.registerEvent(
          this.app.workspace.on('active-leaf-change', () => {
              this.leaveLinkSelectionMode();

              if (this.isInMarkdownReadMode()) {
                this.startListening();
              } else {
                this.stopListening();
              }
          })
      );
    }


    stopNavigator() {
      this.stopListening();
    }


    private isModalOpen(): boolean {
      let modal = document.querySelector('.modal');
      if (modal === null) {
        modal = document.querySelector('.modal-container');
      }
      return modal !== null;
    }


    private startListening() {
      document.addEventListener('keydown', this.keydownListener);
      window.addEventListener('scroll', 
                              // this.throttle(
                                this.updateOverlays.bind(this),
                                // 10),
                                true);
    }


    private stopListening() {
      document.removeEventListener('keydown', this.keydownListener);
      window.removeEventListener('scroll', this.updateOverlays.bind(this), true);
    }


    private isInMarkdownReadMode(): boolean {
      const activeLeaf = this.app.workspace.activeLeaf;
      return activeLeaf?.view.getViewType() === 'markdown' // && !activeLeaf.view.getState().mode;
    }


    private keydownListener = (evt: KeyboardEvent) => {
      if (this.isInMarkdownReadMode()) {
          this.handleKeyPress(evt);
      }
    };


    // Throttling function to limit how often a function can run
    private throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }


    private handleKeyPressFunc(evt: KeyboardEvent) {
      if (!this.isInMarkdownReadMode()) {
          return;
      }
      if (this.isModalOpen()) {
        this.leaveLinkSelectionMode();
        return;
      }

      // Link Selection Mode
      if (this.isInLinkSelectionMode) {
        if (evt.key === 'Escape') {
          this.leaveLinkSelectionMode();

        // number: select link
        } else if (evt.key.length === 1 && /[0-9]/.test(evt.key)) { 
          this.linkSelectionInput += evt.key;
          const key = parseInt(this.linkSelectionInput, 10);
          if (this.linkFilter.checkLinkMap(key)) {
            this.linkFilter.clickLink(key, this.openInNewTab)
            this.leaveLinkSelectionMode();
            this.linkSelectionInput = '';
          }

        // Enter: select default link
        } else if (evt.key === 'Enter') {
          let defaultKey = this.linkFilter.getDefaultLink();
          this.linkFilter.clickLink(defaultKey, this.openInNewTab);
          this.leaveLinkSelectionMode();

        // Alphabet character: filter links
        } else if (evt.key.length === 1 && /[a-zA-Z]/.test(evt.key)) {
          this.linkFilter.update(evt.key);
          this.updateOverlays();
        }

      // Markdown Read Mode
      } else {
        this.normalModeInput = ''
        if (evt.key === 'j') {
          this.scroller.scrollDown();
        } else if (evt.key === 'k') {
          this.scroller.scrollUp();
        } else if (evt.key === 'h') {
          this.scroller.scrollLeft();
        } else if (evt.key === 'k') {
          this.scroller.scrollRight();
        } else if (evt.key === 'G') {
          this.scroller.scrollToBottom();
        } else if (evt.key === 'g') {
          this.scroller.scrollToBottom();
        } else if (evt.key === 'k') {
          this.scroller.scrollRight();
        } else if (evt.key === 't') {
          this.app.workspace.getLeaf('tab')
        } else if (evt.key === 'f') {
          this.enterLinkSelectionMode();
        } else if (evt.key === 'F') {
          this.enterLinkSelectionMode(true);
        }
      }
    }


    private removeOverlays() {
      this.overlays.forEach(overlay => overlay.remove());
    }


    private updateOverlays() {
      if (this.isInLinkSelectionMode) {
        this.removeOverlays();

        let startDigitsAt = 1;
        if (this.linkFilter.filteredLinks.length > 9) {
          startDigitsAt = Math.ceil(this.linkFilter.filteredLinks.length / 10) + 1;
        }

        this.linkFilter.filteredLinks.forEach((link, index) => {
          let linkNumber = index + startDigitsAt;
          const newOverlay = new Overlay(link, index, linkNumber, this.openInNewTab);
          this.overlays.push(newOverlay);
          this.linkFilter.setLinkMap(linkNumber, link);
        });
      }
    }


    private handleKeyPress = debounce((evt: KeyboardEvent) => {
      this.handleKeyPressFunc(evt);
    }, 50);


    private enterLinkSelectionMode(forNewTab: boolean = false) {
      if (!this.isInMarkdownReadMode()) {
            return;
        }

      if (forNewTab) {
        this.openInNewTab = true;
      }
      else {
        this.openInNewTab = false
      }
      this.isInLinkSelectionMode = true;
      this.linkFilter.reset();
      this.linkFilter.update();
      this.updateOverlays();
    }


    private leaveLinkSelectionMode() {
        this.removeOverlays();
        this.isInLinkSelectionMode = false;
        this.openInNewTab = false;
        this.linkFilter.reset();
    }
}


import { TFile } from 'obsidian';

export default class NavigatorManager {
    constructor(private app: App, private settings: NavigatorPluginSettings) {
        this.app = app;
        this.settings = settings;
    }

    private isInLinkSelectionMode: boolean = false;
    private openInNewTab: boolean = false;
    private filterInput: string = '';
    private scrollableClassName: string = 'markdown-preview-view.markdown-rendered'
    private linkMap = new Map<number, HTMLAnchorElement>();
    private filteredLinks: HTMLAnchorElement[] = [];
    private keydownListener = (evt: KeyboardEvent) => this.listenKeydown(evt);
    private linkSelectionInput: string = '';
    private filterDisplayBox: HTMLElement | null = null;


    startListening(plugin) {
        plugin.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
            this.handleKeyPress(evt);
        });

        plugin.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                this.leaveLinkSelectionMode();
            })
        );

        window.addEventListener('scroll', this.updateOverlays.bind(this), true);
        this.createFilterDisplayBox();
    }


    stopListening() {
        window.removeEventListener('scroll', 
                                   this.updateOverlays.bind(this), true);
    }


    private resetLinkMap() {
      this.linkMap = new Map<number, HTMLAnchorElement>();
    }


    private handleKeyPress(evt: KeyboardEvent) {
      if (!this.isInReadMode()) {
          return;
      }

      switch (evt.key) {

        case 'j':
          if (!this.isInLinkSelectionMode) {
            this.scrollDown();
          }
          break;

         case 'k':
          if (!this.isInLinkSelectionMode) {
            this.scrollUp();
          }
          break;

         case 'h':
          if (!this.isInLinkSelectionMode) {
            this.scrollUp();
          }
          break;

         case 'l':
          if (!this.isInLinkSelectionMode) {
            this.scrollUp();
          }
          break;

        case 'f':
          this.enterLinkSelectionMode();
          break;

        case 'F':
          this.enterLinkSelectionMode(true);
          break;

        case 't':
          // open new tab
          this.app.workspace.getLeaf('tab');
          break;

        case 'G':
          this.scrollToBottom();
          break;

        case 'g':
          this.scrollToTop();
      }
    }


    private getScrollContainer() {
      const activeLeaf = this.app.workspace.activeLeaf;
      const activeElement = activeLeaf?.view.containerEl;
      const activeScrollableElement = activeElement.querySelector('.markdown-preview-view.markdown-rendered');
      return activeScrollableElement;
    }


    private scroll(xSpeed: number, ySpeed: number) {
      const activeScrollableElement = this.getScrollContainer();
      if (activeScrollableElement) {
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


    private scrollToTop() {
      const scrollContainer = this.getScrollContainer();
      if (scrollContainer) {
        scrollContainer.scrollTo(0, 0);
      }
    }


    private scrollToBottom() {
      const scrollContainer = this.getScrollContainer();
      if (scrollContainer) {
        scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
      }
    }

        
    private isInReadMode(): boolean {
        const activeLeaf = this.app.workspace.activeLeaf;
        return activeLeaf?.view.getViewType() === 'markdown'; // && !activeLeaf.view.getState().mode;
    }


    private getFilteredLinks() {
      this.resetLinkMap();

      let links = Array.from(document.querySelectorAll('a, button, input, div'));
      const clickableClasses = ['internal-link',
                                'external-link',
                                'task-list-item-checkbox',
                                'button-default',
                                'markdown-embed-link',
                                // 'copy-code-button',
                                // 'internal-embed',
                                'code-block-flair',
                                'collapse-indicator'
                                // 'multi-select-pill',
                                // 'clickable-icon',
                                // 'metadata-property-key-input'
                                ]
      const filteredLinks = links.filter(link =>
        clickableClasses.some(className => link.classList.contains(className))
      );

      if (this.filterInput) {
        const inputFilteredLinks = filteredLinks.filter(link => 
          link.innerText.toLowerCase().includes(this.filterInput.toLowerCase()));
          this.filteredLinks = inputFilteredLinks;
      } else {
        this.filteredLinks = filteredLinks;
      }
    }


    private removeOverlays() {
        document.querySelectorAll('.vimium-like-link-overlay').forEach(el => el.remove()); 
        document.querySelectorAll('.default-link-overlay').forEach(el => el.remove()); 
    }


    private createFilterDisplayBox() {
        this.filterDisplayBox = document.createElement('div');
        this.filterDisplayBox.classList.add('navigator-filter-box');
        // this.filterDisplayBox.style.left = '0';
        // this.filterDisplayBox.style.bottom = '0';
        // this.filterDisplayBox.style.display = 'none'; // Initially hidden
        // this.filterDisplayBox.style.position = 'fixed';
        // this.filterDisplayBox.style.zIndex = '1000'; 
        // this.filterDisplayBox.style.width = 'auto'; 
        // this.filterDisplayBox.style.height = 'auto';
        // this.filterDisplayBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        // this.filterDisplayBox.style.color = 'white';
        // this.filterDisplayBox.style.padding = '5px';

        document.body.appendChild(this.filterDisplayBox);
    }
    

    private updateOverlays(forNewTab: boolean = false) {
      if (this.isInLinkSelectionMode) {
        this.removeOverlays();

        let startDigitsAt = 1;
        if (this.filteredLinks.length > 9) {
          startDigitsAt = Math.ceil(this.filteredLinks.length / 10) + 1;
        }


        this.filteredLinks.forEach((link, index) => {
          const overlay = document.createElement('div');

          const computedStyle = window.getComputedStyle(link)
          const fontSize = parseFloat(computedStyle.fontSize);
          const offsetX = -fontSize ;
          const offsetY = -fontSize / 2;

          // styling
          overlay.classList.add('vimium-like-link-overlay');
          if (forNewTab) {
            overlay.classList.add('new-tab-overlay'); // A different class for new tab overlays
          }
          if (index === 0) {  // special styling for default link
            overlay.classList.add('default-link-overlay')
          }

          let linkNumber = index + startDigitsAt;

          overlay.textContent = (linkNumber).toString();

          document.body.appendChild(overlay);

          const rect = link.getBoundingClientRect();
          overlay.style.left = `${rect.left + offsetX}px`;
          overlay.style.top = `${rect.top + offsetY}px`;

          this.linkMap.set(linkNumber, link);
        });
      }
    }


    private checkInternalFileLink(link) {
      const href = link.href
      if (typeof href == 'string') {
        if (href.startsWith('app://obsidian.md/')) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    }


    private getInternalFileLink(link) {
      const href = link.href
      if (href.startsWith('app://obsidian.md/')) {
        return href.replace('app://obsidian.md/', '');
      }
      return null;
    }


    private clickLink(index: number, openInNewTab: boolean = false) {
      if (this.linkMap.has(index)) {
        const link = this.linkMap.get(index);  
        if (this.openInNewTab) {
          if (this.checkInternalFileLink(link)) {
            const internalFileLink = this.getInternalFileLink(link);
            this.app.workspace.openLinkText(internalFileLink, '', 'tab');
          } else {
            link.click();
          }
        } else {
          link?.click();
        }
        this.leaveLinkSelectionMode();
        document.removeEventListener('keydown', this.keydownListener);
      }
    }


    private updateFilterInput(key) {
      this.filterInput += key;
    }


    private listenKeydown(evt: KeyboardEvent) {

      // Escape: leave link selection mode
      if (evt.key === 'Escape') {
        this.leaveLinkSelectionMode();

      // number: select link
      } else if (evt.key.length === 1 && /[0-9]/.test(evt.key)) { // check if the key is a number
        this.linkSelectionInput += evt.key;
        const key = parseInt(this.linkSelectionInput, 10);
        if (this.linkMap.has(key)) {
          this.clickLink(key)
          this.linkSelectionInput = '';
        }

      // Enter: select default link
      } else if (evt.key === 'Enter') {
        let defaultKey = this.linkMap.keys().next().value
        this.clickLink(defaultKey)

      // Alphabet character: filter links
      } else if (evt.key.length === 1 && /[a-zA-Z]/.test(evt.key)) {
        this.updateFilterInput(evt.key);
        this.getFilteredLinks();
        this.updateOverlays(this.openInNewTab);
        this.updateFilterDisplayBox();
      }
    }


    private updateFilterDisplayBox() {
      if (this.filterDisplayBox) {
        this.filterDisplayBox.textContent = `Filter: ${this.filterInput}`
        this.filterDisplayBox.style.display = 'block'
        console.log(this.filterDisplayBox)
      }
    }


    private enterLinkSelectionMode(forNewTab: boolean = false) {
      if (!this.isInReadMode()) {
            return;
        }

      if (forNewTab) {
        this.openInNewTab = true;
      }
      else {
        this.openInNewTab = false
      }
      this.isInLinkSelectionMode = true;
      this.filterInput = '';
      this.getFilteredLinks();
      this.updateOverlays(forNewTab);

      document.addEventListener('keydown', this.keydownListener);
    }


    private leaveLinkSelectionMode() {
        this.removeOverlays();
        this.isInLinkSelectionMode = false;
        this.filterInput = '';
        this.resetLinkMap();
        this.linkSelectionInput = '';
        this.openInNewTab = false;
        this.filteredLinks = [];
        if (this.filterDisplayBox) {
          this.filterDisplayBox.style.display = 'none';
        }
        document.removeEventListener('keydown', this.keydownListener);
    }

}


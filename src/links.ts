export default class LinkFilter {
  constructor(private app: App) {
    this.app = app;
  }
  filteredLinks: HTMLAnchorElement[] = [];

  private filterInput: string = '';
  private linkMap = new Map<number, HTMLAnchorElement>();
  private linkSelectionInput: string = '';
  private filterDisplayBox: HTMLElement | null = null;
  private clickableClasses: string[] = ['internal-link',
                                        'external-link',
                                        'task-list-item-checkbox',
                                        'button-default',
                                        'markdown-embed-link',
                                        // 'copy-code-button',
                                        // 'internal-embed',
                                        // 'code-block-flair',
                                        // 'collapse-indicator'
                                        // 'multi-select-pill',
                                        // 'clickable-icon',
                                        // 'metadata-property-key-input'
                                        ];
  private clickableElements: string = 'a, button, input';
  private filterBoxClass: string = 'navigator-filter-box';
  private internalLinkUrl: string = 'app://obsidian.md/'
  private clientHeight: number = 0;


  setup() {
    this.createFilterDisplayBox();
  }


  checkLinkMap(key: number) {
    if (this.linkMap.has(key)) {
      return true;
    }
    return false;
  }


  getDefaultLink() {
    return this.linkMap.keys().next().value
  }


  async update(key: string | null = null, contentEl: HTMLElement) {
    if (key !== null) {
      this.updateFilterInput(key);
      this.updateFilterDisplayBox();
    }
    await this.updateFilteredLinks(contentEl);
  }


  setLinkMap(linkNumber: number, link: string) {
    this.linkMap.set(linkNumber, link);
  }


  reset() {
    this.filterInput = '';
    this.resetLinkMap();
    this.linkSelectionInput = '';
    this.filteredLinks = [];
    if (this.filterDisplayBox) {
      this.filterDisplayBox.style.display = 'none';
    }
  }


  private createFilterDisplayBox() {
      this.filterDisplayBox = document.createElement('div');
      this.filterDisplayBox.classList.add(this.filterBoxClass);
      document.body.appendChild(this.filterDisplayBox);
  }


  updateFilterInput(key) {
    this.filterInput += key;
  }


  private updateFilterDisplayBox() {
    if (this.filterDisplayBox) {
      this.filterDisplayBox.textContent = `Filter: ${this.filterInput}`;
      this.filterDisplayBox.style.display = 'block';
    }
  }


  private resetLinkMap() {
    this.linkMap = new Map<number, HTMLAnchorElement>();
  }


  private isElementInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.bottom <= this.clientHeight
    );
  }


  private isVisible(el: HTMLElement): boolean {
    return this.isElementInViewport(el);
  }


  private getVisibleElements(elements: HTMLElement[]): HTMLElement[] {
    return elements.filter((element) => this.isVisible(element));
  }


  private async updateFilteredLinks(contentEl: HTMLElement) {
    this.resetLinkMap();
    this.clientHeight = document.documentElement.clientHeight;

    let links = Array.from(contentEl.querySelectorAll(this.clickableElements));

    let filteredLinks = links.filter(link =>
      this.clickableClasses.some(className => link.classList.contains(className))
    );
    filteredLinks = this.getVisibleElements(filteredLinks);

    if (this.filterInput) {
      const inputFilteredLinks = filteredLinks.filter(link => 
        link.innerText.toLowerCase().includes(this.filterInput.toLowerCase()));
        this.filteredLinks = inputFilteredLinks;
    } else {
      this.filteredLinks = filteredLinks;
    }
  }


  private checkInternalFileLink(link) {
    const href = link.href
    if (typeof href == 'string') {
      if (href.startsWith(this.internalLinkUrl)) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  }


  private getInternalFileLink(link) {
    const href = link.href
    if (href.startsWith(this.internalLinkUrl)) {
      return href.replace(this.internalLinkUrl, '');
    }
    return null;
  }


  clickLink(index: number, openInNewTab: boolean = false) {
    if (this.linkMap.has(index)) {
      const link = this.linkMap.get(index);  
      if (openInNewTab) {
        if (this.checkInternalFileLink(link)) {
          const internalFileLink = this.getInternalFileLink(link);
          this.app.workspace.openLinkText(internalFileLink, '', 'tab');
        } else {
          link.click();
        }
      } else {
        link?.click();
      }
    }
  }
}

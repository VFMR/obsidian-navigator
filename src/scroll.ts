import NavigatorPluginSettings from './settings'


export default class NavigatorScroll {
  constructor(private app: App, private settings: NavigatorPluginSettings) {
      this.app = app;
      this.settings = settings;
  }

  private scrollableClassName: string = 'markdown-preview-view.markdown-rendered';

  private getScrollContainer() {
    const activeLeaf = this.app.workspace.activeLeaf;
    const activeElement = activeLeaf?.view.containerEl;
    const activeScrollableElement = activeElement.querySelector('.' + this.scrollableClassName);
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
}


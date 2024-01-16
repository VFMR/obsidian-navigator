import { MarkdownView } from 'obsidian';
import NavigatorPluginSettings from './settings'


export default class NavigatorScroll {
  constructor(private app: App, private settings: NavigatorPluginSettings) {
      this.app = app;
      this.settings = settings;
  }

  // private scrollableClassName: string = 'markdown-preview-view.markdown-rendered';

  private getScrollContainer() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view) {
      return view.previewMode;
    }
  }


  private scroll(speed: number) {
    const activeScrollableElement = this.getScrollContainer();
    const currentScroll = activeScrollableElement.getScroll();
    const position = currentScroll + speed;
    this.scrollTo(position);
  }


  private scrollTo(position: number) {
    const activeScrollableElement = this.getScrollContainer();
    if (activeScrollableElement) {
      activeScrollableElement.applyScroll(position);
    }
  }


  scrollDown() {
    this.scroll(this.settings.scrollSpeed);
  }


  scrollUp() {
    this.scroll(-this.settings.scrollSpeed);
  }


  scrollToTop() {
    this.scrollTo(0);
  }


  // scrollToBottom() {
  //   this.scrollTo(); 
  // }
}


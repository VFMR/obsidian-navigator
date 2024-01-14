export default class Overlay {

  overlay: HTMLDivElement;
  baseClass: string = 'vimium-like-link-overlay';
  newTabClass: string = 'new-tab-overlay';
  defaultLinkClass: string = 'default-link-overlay';
  allClassNames: string[] = [this.baseClass, this.newTabClass, this.defaultLinkClass];

  constructor(link: string, index: number, linkNumber: number, newTab: boolean = false) {
    let overlay = document.createElement('div');
    const computedStyle = window.getComputedStyle(link)
    const fontSize = parseFloat(computedStyle.fontSize);
    const offsetX = -fontSize ;
    const offsetY = -fontSize / 2;

    // styling
    overlay.classList.add(this.baseClass);
    if (index === 0) {  // special styling for default link
      overlay.classList.add(this.defaultLinkClass)
    } else if (newTab) {
      overlay.classList.add(this.newTabClass); // A different class for new tab overlays
    }

    overlay.textContent = (linkNumber).toString();
    document.body.appendChild(overlay);
    const rect = link.getBoundingClientRect();
    overlay.style.left = `${rect.left + offsetX}px`;
    overlay.style.top = `${rect.top + offsetY}px`;

    this.overley = overlay;
  }


  remove() {
    this.allClassNames.forEach(className => document.querySelectorAll(`.${className}`).forEach(el => el.remove()));
  }
} 


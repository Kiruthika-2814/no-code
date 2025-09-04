//import { Directive, ElementRef, EventEmitter, Output, HostListener, Renderer2, OnInit } from '@angular/core';

//@Directive({
  //selector: '[appResizable]',
  //standalone: true})
//export class ResizableDirective implements OnInit {
  //@Output() resize = new EventEmitter<{ width: number; height: number }>();

  //private handle: HTMLElement | null = null;
  //private isResizing = false;
  //private startX = 0;
  //private startY = 0;
  //private startWidth = 0;
  //private startHeight = 0;

  //constructor(private el: ElementRef, private renderer: Renderer2) {}

  //ngOnInit() {
    //this.createResizeHandle();
  //}

  //private createResizeHandle() {
    //this.handle = this.renderer.createElement('div');
    //this.renderer.addClass(this.handle, 'resize-handle');
    //this.renderer.appendChild(this.el.nativeElement, this.handle);
  //}

  //@HostListener('mousedown', ['$event'])
 // onMouseDown(event: MouseEvent) {
    //if (event.target === this.handle) {
      //this.isResizing = true;
      //this.startX = event.clientX;
      //this.startY = event.clientY;
      //this.startWidth = this.el.nativeElement.offsetWidth;
      //this.startHeight = this.el.nativeElement.offsetHeight;
      //event.preventDefault();
     // event.stopPropagation();
    //}
  //}

  //@HostListener('document:mousemove', ['$event'])
  //onMouseMove(event: MouseEvent) {
    //if (!this.isResizing) return;

    //const width = this.startWidth + (event.clientX - this.startX);
    //const height = this.startHeight + (event.clientY - this.startY);

   // this.renderer.setStyle(this.el.nativeElement, 'width', width + 'px');
    //this.renderer.setStyle(this.el.nativeElement, 'height', height + 'px');

   // this.resize.emit({ width, height });
 // }

  //@HostListener('document:mouseup')
  //onMouseUp() {
    //if (this.isResizing) {
      //this.isResizing = false;
   // }
 // }
//}
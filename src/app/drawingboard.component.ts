import {
    Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';

@Component({
    selector: 'app-canvas',
    template: '<canvas #canvas></canvas>',
    styles: ['canvas { border: 1px solid #000; }']
})
export class CanvasComponent implements AfterViewInit {
    // a reference to the canvas element from our template
    @ViewChild('canvas') public canvas: ElementRef;

    // setting a width and height for the canvas
    @Input() public width = 400;
    @Input() public height = 400;

    private cx: CanvasRenderingContext2D;

    public ngAfterViewInit() {
        // get the context
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');

        // set the width and height
        canvasEl.width = this.width;
        canvasEl.height = this.height;

        // set some default properties about the line
        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#000';

        // we'll implement this method to start capturing mouse events
        this.captureEvents(canvasEl);
    }
}
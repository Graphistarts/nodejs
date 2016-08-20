/// <reference path="../../node_modules/angular2/typings/browser.d.ts" />
import {Component} from 'angular2/core';
import {TestComponent} from './course.component.ts.min.js';

@Component({
    selector: '[user-name]',
    template: '<h1>Kév</h1>',
    directives: [TestComponent]
})
export class AppComponent { }
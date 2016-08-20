"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("angular2/core");
var TestComponent = (function () {
    function TestComponent() {
        this.title = "I am a test";
        this.posts = ["li un", "li deux", "li trois"];
    }
    TestComponent = __decorate([
        core_1.Component({
            selector: "test",
            template: "this is a test called {{title}}\n\n    <ul>\n        <li *ngFor=\"let post of posts\">\n            {{post}}\n        </li>\n    </ul>\n\n    "
        })
    ], TestComponent);
    return TestComponent;
}());
exports.TestComponent = TestComponent;

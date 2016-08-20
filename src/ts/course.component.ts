import {Component} from "angular2/core";

@Component({
    selector:"test",
    template:`this is a test called {{title}}

    <ul>
        <li *ngFor="let post of posts">
            {{post}}
        </li>
    </ul>

    `
})

export class TestComponent{

    title="I am a test";
    posts = ["li un", "li deux", "li trois"];
}
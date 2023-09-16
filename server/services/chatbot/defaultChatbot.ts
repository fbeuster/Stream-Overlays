import { Chatbot } from "./chatbot";

export class VoidChatbot implements Chatbot {
    constructor() {
        // construct nothing
    }

    public say (message: string) {
        // say nothing
    }
}
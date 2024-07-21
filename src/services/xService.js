import { Rettiwt } from "rettiwt-api";
import config from "../config.json" assert { type: "json" };

let _rettiwt;

export default {
    name: "X Service",
    data: {

    },
    methods: {
        async saveTweetMetadata(tweet) {

        },
        async fetch(){

            if (!_rettiwt) return;
            try {
                for await (const tweet of _rettiwt.tweet.stream({fromUsers: ['{USERNAME}']}, wait)) {
                    console.log(tweet);
                }
            } catch (err) {
                console.log(err);
            }
        }
    },
    async execute() {
        _rettiwt = new Rettiwt({apiKey: config.api_key});
        await this.methods.fetch();
    }
}
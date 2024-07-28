import { Rettiwt } from "rettiwt-api";
import config from "../config.json" assert { type: "json" };
import OpenAI from "openai";

let _rettiwt;
let _openAI;

const vm = {
  name: "X Service",
  data: {
    isStreaming: false,
  },
  methods: {
    /**
     * Fetches data from tweet by given id;
     * @param id The id of the tweet to fetch
     * @returns {Promise<any>} The tweet data
     */
    async fetchTweet(id) {
      return await _rettiwt.tweet
        .details(id)
        .then((res) => {
          if (res === undefined) return null;
          return res;
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    },

    async saveTweetMetadata(tweet, aiResponse) {
      console.log("Saving tweet metadata", tweet);
      const author = tweet.tweetBy;
    },

    /**
     * Check if a tweet is relevant to the subjects we are interested in. It skips this part if the OpenAI API is not enabled.
     * @param tweet The tweet to check
     * @returns {Promise<void>}
     */
    async checkTweetRelevance(tweet) {
      if (!config.openAI.enabled) {
        await this.methods.saveTweetMetadata(tweet);
        return;
      }

      let quotedTweet = "none";

      if (tweet.quoted) {
        quotedTweet = await vm.methods.fetchTweet(tweet.quoted);
      }

      const subjects = config.x.FetchTweets.subjects.join(", ");
      const prompt = config.x.FetchTweets.prompts.relevanceCheck.replace(
        "{SUBJECTS}",
        subjects,
      );

      let userMessage = `Tweet: ${tweet.fullText}, Quoted Tweet: {QUOTED_TWEET}`;

      if (quotedTweet.fullText) {
        userMessage = userMessage.replace(
          "{QUOTED_TWEET}",
          quotedTweet.fullText,
        );
      }

      const completion = await _openAI.chat.completions.create({
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        model: config.openAI.model,
        response_format: { type: "json_object" },
      });

      try {
        const raw = completion.choices[0].message.content;
        let response = JSON.parse(raw);

        if (response.isRelevant) {
          await this.methods.saveTweetMetadata(tweet, response);
        }
      } catch (err) {
        console.error(err);
      }
    },

    /**
     * Starts the stream of tweets and processes them;
     * @returns {Promise<void>}
     */
    async stream() {
      if (!_rettiwt) return;

      if (vm.data.isStreaming) {
        console.log(
          "It seems we are already streaming. Stop the current stream first.",
        );
        return;
      }

      try {
        vm.data.isStreaming = true;
        console.log("Fetching tweets...");
        for await (const tweet of _rettiwt.tweet.stream(
          { fromUsers: config.x.FetchTweets.fromUsers },
          config.x.FetchTweets.pollingInterval,
        )) {
          console.log("Tweet received", tweet);
          await vm.methods.checkTweetRelevance(tweet);
        }
      } catch (err) {
        console.error(err);
      }
    },
    initializeRettiwt() {
      return new Rettiwt({ apiKey: config.x.api_key });
    },
    initializeOpenAI() {
      return new OpenAI({ apiKey: config.openAI.api_key });
    },
  },
  async execute() {
    _rettiwt = this.methods.initializeRettiwt();
    _openAI = this.methods.initializeOpenAI();

    await this.methods.stream();
  },
};

export default vm;

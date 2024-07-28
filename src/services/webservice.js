import express from "express";
const app = express();
const port = 3000;

const vm = {
  name: "Web Service",
  methods: {
    registerWebRoutes() {
      app.get("/", (req, res) => {
        res.send("Hello World!");
      });
    },
    registerApiRoutes() {},
  },
  async execute() {
    this.methods.registerWebRoutes();
    this.methods.registerApiRoutes();

    app.listen(port, () => {
      console.log(
        `Example app listening on port ${port} URL: http://localhost:${port}`,
      );
    });
  },
};

export default vm;

import express from 'express'
const app = express()
const port = 3000

export default {
    name: "Web Service",
    methods: {
        registerRoutes()
        {
            app.get('/', (req, res) => {
                res.send('Hello World!')
            })
        }
    },
    async execute() {
        this.methods.registerRoutes();

        app.listen(port, () => {
            console.log(`Example app listening on port ${port} URL: http://localhost:${port}`);
        });
    }
}
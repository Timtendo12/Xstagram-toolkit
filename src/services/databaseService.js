import mysql from 'mysql';
import config from "../config.json" assert { type: "json" };

let _connection = null;

export default {
    name: "Database Service",
    methods: {
        async executeSql(sql, values) {
          if (!_connection) {
              this.methods.createConnection();
          }

          _connection.connect();
          _connection.query(sql, values, function (error, results, fields) {
              // error will be an Error if one occurred during the query
              // results will contain the results of the query
              // fields will contain information about the returned results fields (if any)

                if (error) {
                    console.log(error);
                    return null;
                }

                return results;
          });
        },
        createConnection(force = false) {
            if (_connection && !force) {
                console.log("Connection already exists");
            }

            _connection = mysql.createConnection({
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.database
            });
        }
    },
    async execute() {
        this.methods.createConnection();
    }
}
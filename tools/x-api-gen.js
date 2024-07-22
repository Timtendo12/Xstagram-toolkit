import config from "../src/config.json" assert { type: "json" };
import fs from "fs";
import path from "path";
import { Rettiwt } from "rettiwt-api";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rettiwt = new Rettiwt();

const args = process.argv.slice(2);

// check if 1 of the args = help
if (args.includes("help")) {
  console.log(
    "Parameters:\nhelp - Show this help\n--eli, removes login info from config.json\n\n",
  );
  process.exit(0);
}

let eli = args.includes("--eli");

// first check if we have write permission to the config file
if (!writeAccessCheck()) {
  console.error("No write access to config.json");
  process.exit(1);
}

// check if config is valid
configValidationCheck();

let apiKey = null;

try {
  apiKey = await rettiwt.auth.login(
    config.x.email,
    config.x.username,
    config.x.password,
  );
  await writeAndUpdateConfig(apiKey);
} catch (e) {
  console.error(e);
  process.exit(1);
}

async function writeAndUpdateConfig(apiKey) {
  // now we have the api key, we can get the content of the config file, update it and write it back
  const configPath = path.resolve(__dirname, "../src/config.json");
  config.api_key = apiKey;

  if (eli) {
    config.x.email = "";
    config.x.password = "";
    config.x.username = "";
  }

  try {
    await fs.promises.writeFile(configPath, JSON.stringify(config, null, 4));
    console.log("API key has been written to config.json");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function writeAccessCheck() {
  try {
    await fs.promises.access(
      path.resolve(__dirname, "../src/config.json"),
      fs.constants.W_OK,
    );
    return true;
  } catch {
    return false;
  }
}

function configValidationCheck() {
  if (!config) {
    console.error("config.json is empty");
    process.exit(1);
  }

  if (!config.x) {
    console.error('config.json is missing "x" object');
    process.exit(1);
  }

  if (
    !config.x.email.length ||
    !config.x.password.length ||
    !config.x.username.length
  ) {
    console.error(
      'config.json is missing "x.email", "x.password" or "x.username" or one of them is empty',
    );
    process.exit(1);
  }
}

// services
import webService from "./services/webservice.js";
import xService from "./services/xService.js";

loadAndRunServices().catch((error) => {
  console.error(error);
});

async function loadAndRunServices() {
  webService.execute().catch((error) => {
    console.error(error);
  });

  xService.execute().catch((error) => {
    console.error(error);
  });
}

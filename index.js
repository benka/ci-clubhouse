var Clubhouse = require('clubhouse-lib');

const WORKFLOW_COMPLETED = 500000002;
const WORKFLOW_IN_DEV = 500000004;
const WORKFLOW_READY_REVIEW = 500000005;
const WORKFLOW_READY_DEPLOY = 500000006;
const project_id = { "web": 108, "ps": 725 };
const clientConfig = {
  baseURL: 'https://api.clubhouse.io',
  version: 'v2'
};
const updateParams = { 'workflow_state_id': WORKFLOW_COMPLETED };

try {
  var id = project_id.web;
  if (process.argv.length > 2) {
    process.argv.forEach(function(arg) {
      console.log("arg:", arg);
      if (arg.startsWith("--project_id")) {
        id = arg.split('=')[1]
      }
    })
    console.log(id);
  } 

  if (!process.env.CLUBHOUSE_API_TOKEN) {
    throw 'ERROR: CLUBHOUSE_API_TOKEN environment variable missing.';
  }

  const api_token = process.env.CLUBHOUSE_API_TOKEN;
  const client = Clubhouse.create(api_token, clientConfig);

  client.listStories(id).then(
    cards => {
      // filter for READY_TO_DEPLOY status
      console.log("Project [",id,"] Cards found: ", cards.length);

      const cardsReady = cards.filter(card => card.workflow_state_id == WORKFLOW_READY_DEPLOY);
      cardsReady.forEach(function(card) {
        console.log(" > [",id,"] ", card.id);
        client.updateStory(card.id, updateParams);
      });
    }
  );

} catch (e) {
  console.log(`\n${e}\n\n`)
}

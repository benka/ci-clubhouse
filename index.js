var Clubhouse = require('clubhouse-lib');

const STATUS_UNSCHEDULED = 500000003;
const STATUS_NEXT_UP = 500000032;
const STATUS_IN_DEVELOPMENT = 500000004;
const STATUS_DEPLOYED_TO_DEV = 500000005;
const STATUS_DEPLOYED_TO_QA = 500000006;
const STATUS_REVIEWED_ON_QA = 500016658;
const STATUS_DEPLOYED_TO_STAGING = 500016697;
const STATUS_READY_FOR_RELEASE = 500016677;
const STATUS_LIVE = 500000002;
const STATUS_NON_REPRODUCIBLE = 500016369;

const project_id = { "web": 108, "ps": 725 };
const clientConfig = {
  baseURL: 'https://api.clubhouse.io',
  version: 'v2'
};

const getStatus = (status) => {
  switch (status) {
    case 'UNSCHEDULED':
      return STATUS_UNSCHEDULED;
      break;
    case 'NEXT_UP':
      return STATUS_NEXT_UP;
      break;
    case 'IN_DEVELOPMENT':
      return STATUS_IN_DEVELOPMENT;
      break;
    case 'DEPLOYED_TO_DEV':
      return STATUS_DEPLOYED_TO_DEV;
      break;
    case 'DEPLOYED_TO_QA':
      return STATUS_DEPLOYED_TO_QA;
      break;
    case 'REVIEWED_ON_QA':
      return STATUS_REVIEWED_ON_QA;
      break;
    case 'DEPLOYED_TO_STAGING':
      return STATUS_DEPLOYED_TO_STAGING;
      break;
    case 'READY_FOR_RELEASE':
      return STATUS_READY_FOR_RELEASE;
      break;
    case 'LIVE':
      return STATUS_LIVE;
      break;
    case 'NON_REPRODUCIBLE':
      return STATUS_NON_REPRODUCIBLE;
      break;
  }
}

const updateParams = (status = STATUS_LIVE) => {
  return { 'workflow_state_id': getStatus(status)};
}

const listWorkflows = (client) => {
  client.listWorkflows().then(
    workflow => {
      console.log(">>>",workflow[0].states);
    }
  )
  .catch(e => {console.log(e)});
}

const listStories = (client, id, status) => {
  client.listStories(id).then(
    cards => {
      // filter for READY_TO_DEPLOY status
      const cardsFiltered = cards.filter(card => card.workflow_state_id == getStatus(status.from));
      console.log("Project [",id,"] Cards found: ", cards.length, "Filtered: ", cardsFiltered.length);
      cardsFiltered.forEach(function(card) {
        console.log(" > [",id,"] ", card.id);
        client.updateStory(card.id, updateParams(status.to));
      })
    }
  )
  .catch(e => {console.log(e)});
}

try {
  var id = project_id.web;
  var status = {
    from: STATUS_READY_FOR_RELEASE,
    to: STATUS_LIVE
  };
  if (process.argv.length > 2) {
    process.argv.forEach(function(arg) {
      console.log("arg:", arg);
      switch (arg.split('=')[0]) {
        case "--project_id":
          id = arg.split('=')[1]
          break;
        case "--from-status":
          status.from = arg.split('=')[1]
          break;
        case "--to-status":
          status.to = arg.split('=')[1]
          break;
      }
    })
  } 

  if (!process.env.CLUBHOUSE_API_TOKEN) {
    throw 'ERROR: CLUBHOUSE_API_TOKEN environment variable missing.';
  }

  const api_token = process.env.CLUBHOUSE_API_TOKEN;
  console.log(clientConfig, api_token, status);
  const client = Clubhouse.create(api_token, clientConfig);
  // listWorkflows(client);
  listStories(client, id, status);

} catch (e) {
  console.log(`\n${e}\n\n`)
}

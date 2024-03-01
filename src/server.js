/**
 * The core server that runs on a Cloudflare worker.
 */
import * as Realm from 'realm-web';
let maincoll;
import { Router } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { COURSES_COMMAND, WATCH_COMMAND} from './commands.js';
import {  getCourses, getCrnSeats, sendMessage, sendStr } from './reddit.js';

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

let App;

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});
router.get('/test', async (request, env) => {
  //await scheduledEventHandler("", env)
  return new Response(`yh   ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
      
      case COURSES_COMMAND.name.toLowerCase(): {
        const subject = interaction.data.options[1].value
        const coursenum = interaction.data.options[2].value
        const term = interaction.data.options[0].value
        const test =  await getCourses(subject, coursenum, term)
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: test
        });
      }
      case WATCH_COMMAND.name.toLowerCase(): {
        
        App = App || new Realm.App(env.MONGODB_REALM_APPID);
        const token = env.MONGO_API
        const credentials = Realm.Credentials.apiKey(token);
        // Attempt to authenticate
        var user = await App.logIn(credentials);
        var client = user.mongoClient('mongodb-atlas');
        const collection =  await client.db('cloudflare').collection('todos');
        maincoll =collection

        const subject = interaction.data.options[1].value
        const coursenum = interaction.data.options[2].value
        const term = interaction.data.options[0].value
        const crn = interaction.data.options[3].value
        const prof = await getCrnSeats(subject,coursenum,term,crn)
        if (!prof) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Error ❌"
            }
          })
        }
        
        const filter = {
          subject: subject,          // Replace 'POLS' with the desired subject
          term: term,           // Replace '202405' with the desired term
          coursenum: coursenum,        // Replace '1101' with the desired course number
          'prof.courseReferenceNumber': crn // Replace '53484' with the desired CRN
        };
        const documents = await collection.findOne(filter);
        if (documents) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "Already in watchlist ❌"
            }
          })
        } else {
          // No document matching the filter criteria was found, so add the new document to the collection
          await collection.insertOne({
            subject: subject,
            coursenum: coursenum,
            term: term,
            prof: prof
          });
          // Set succadd to true indicating successful addition
        }


       
        //await sendMessage(subject, coursenum, term, crn, env)
        //await scheduledEventHandler("", env, collection)
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Successfully✅ added ${prof.faculty.map(w => w.displayName).join(', ')} ${subject}${coursenum} -- ${crn} to watchlist`
          }
        })
        //implement
      }
      default:
        return new JsonResponse({ error: 'Unknown Type ❌' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest: verifyDiscordRequest,
  fetch: async function (request, env) {
    
    return router.handle(request, env);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(scheduledEventHandler(event, env));
  },
};
async function scheduledEventHandler(event, env) {
  let App1 = new Realm.App(env.MONGODB_REALM_APPID);
        const token = env.MONGO_API
        const credentials = await Realm.Credentials.apiKey(token);
        // Attempt to authenticate
        var user = await App1.logIn(credentials);
        var client = await user.mongoClient('mongodb-atlas');
        const db =  await client.db('cloudflare')
        const collection = await db.collection('todos');
  const cursor = await collection.find();
  let documents= []
  await cursor.forEach(doc => documents.push(doc));

  // Process each document in the array
  await Promise.all(documents.map(async doc => {
    // Check if the document and its nested fields exist before accessing them
    if (doc && doc.prof && doc.prof.courseReferenceNumber) {
      
      const newProf = await getCrnSeats(doc.subject, doc.coursenum, doc.term, doc.prof.courseReferenceNumber)
      if (newProf.seatsAvailable < doc.prof.seatsAvailable) {

      await sendStr(`WATCHLIST ALERT⚠️: ${newProf.faculty.map(w => w.displayName).join(', ')} ${newProf.subject}${doc.coursenum} SOMEONE REGISTERED - CRN:${newProf.courseReferenceNumber}`, env)
      await collection.updateOne(
        { "prof.courseReferenceNumber": doc.prof.courseReferenceNumber },
        { $set: { prof: newProf } }
      );
      //await sendMessage(doc.subject, doc.coursenum, doc.term, doc.prof.courseReferenceNumber, env);
      }
    } 
  }));
}
/*
addEventListener('scheduled', event => {
  event.waitUntil(scheduledEventHandler(event, "", ""));
});
*/
export default server;

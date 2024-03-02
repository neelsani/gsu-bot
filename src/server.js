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
import { COURSES_COMMAND, DUMP_COMMAND, REMOVE_COMMAND, WATCH_COMMAND} from './commands.js';
import {  getCourses, getCrnSeats, sendStr } from './reddit.js';
import { createProfessorField1 } from './messages.js';


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

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋GSU-BOT`);
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
        
        const App = new Realm.App(env.MONGODB_REALM_APPID);
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
      case DUMP_COMMAND.name.toLowerCase(): {

      const App= await new Realm.App(env.MONGODB_REALM_APPID);
      const token = env.MONGO_API
      const credentials = await Realm.Credentials.apiKey(token);
      // Attempt to authenticate
      var user = await App.logIn(credentials);
      var client = await user.mongoClient('mongodb-atlas');
      let db =  await client.db('cloudflare')
      let collection = await db.collection('todos');
     
      while (typeof collection.find != 'function') {
        user = await App.logIn(credentials);
        client = await user.mongoClient('mongodb-atlas');
        db =  await client.db('cloudflare')
        collection = await db.collection('todos');
      }
      //return collection
      
      const cursor = await collection.find()
      let numResults = 0


        const embed = {
          content: "",
          tts: false,
          embeds: [
            {
            id: 77412190,
            
            description: `Below is a list of professors in the watchlist`,
            color: 54783,
            fields: await Promise.all(cursor.map( async professor => { 
              numResults++
              return  await createProfessorField1(professor.prof.faculty.map(w => w.displayName).join(', '), professor.prof.courseReferenceNumber, professor.prof.seatsAvailable, professor.prof.maximumEnrollment, professor.prof.meetingsFaculty[0].meetingTime.startDate,professor.prof.meetingsFaculty[0].meetingTime.endDate, professor.prof.subject, professor.prof.courseNumber)
            }
              )),
            title: `Professors - ${numResults} results`,
            }
          ],
          components: [],
          actions: {}
          }
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: embed
          });
        }
      case REMOVE_COMMAND.name.toLowerCase(): {
        const App = new Realm.App(env.MONGODB_REALM_APPID);
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
        const filter = {
          subject: subject,          // Replace 'POLS' with the desired subject
          term: term,           // Replace '202405' with the desired term
          coursenum: coursenum,        // Replace '1101' with the desired course number
          'prof.courseReferenceNumber': crn // Replace '53484' with the desired CRN
        };

        const documents = await collection.findOne(filter);
        if (documents) {
          await collection.deleteOne(filter)

          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Sucessfully✅ removed ${documents.prof.faculty.map(w => w.displayName).join(', ')} ${subject}${coursenum} - crn: ${documents.prof.courseReferenceNumber}`
            }
          })
        } else {
          // No document matching the filter criteria was found, so add the new document to the collection
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Not in watchlist❌`
            }
          })
          // Set succadd to true indicating successful addition
        }
        
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
  console.log("executing cron trigger")
  const App= await new Realm.App(env.MONGODB_REALM_APPID);
  const token = env.MONGO_API
  const credentials = await Realm.Credentials.apiKey(token);
  // Attempt to authenticate
  var user = await App.logIn(credentials);
  var client = await user.mongoClient('mongodb-atlas');
  let db =  await client.db('cloudflare')
  let collection = await db.collection('todos');
 
  while (typeof collection.find != 'function') {
    user = await App.logIn(credentials);
    client = await user.mongoClient('mongodb-atlas');
    db =  await client.db('cloudflare')
    collection = await db.collection('todos');
  }
  //return collection
  
  const cursor = await collection.find()
  console.log("collected documents in watchlist")
 await cursor.map(async doc=>{
  if (doc && doc.prof && doc.prof.courseReferenceNumber) {
      
    const newProf = await getCrnSeats(doc.subject, doc.coursenum, doc.term, doc.prof.courseReferenceNumber)
    if (newProf.seatsAvailable < doc.prof.seatsAvailable) {
    console.log(`notifying change in ${newProf.courseReferenceNumber}`)

    await sendStr(`@xpde WATCHLIST ALERT⚠️: ${newProf.faculty.map(w => w.displayName).join(', ')} ${newProf.subject}${doc.coursenum} SOMEONE REGISTERED - CRN:${newProf.courseReferenceNumber}`, env)
    await collection.updateOne(
      { "prof.courseReferenceNumber": doc.prof.courseReferenceNumber },
      { $set: { prof: newProf } }
    );
    console.log(`updating ${newProf.courseReferenceNumber}`)
    //await sendMessage(doc.subject, doc.coursenum, doc.term, doc.prof.courseReferenceNumber, env);
    }
  } 
}
  
 )
 console.log("cron trigger finished ")
 return "done"
  
  
  //return cursor
  
  // Process each document in the array
  
}
/*
addEventListener('scheduled', event => {
  event.waitUntil(scheduledEventHandler(event, "", ""));
});
*/
export default server;

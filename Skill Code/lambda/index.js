// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

const numberOfGames = 1;
var welcomeMessage = 'Welcome to the Family Games Alexa App. Currently we have ' + numberOfGames + ' games available to play.';
welcomeMessage = welcomeMessage + ' That means we only have Sheng Ji to play, please start off by saying Team one, or which ever number it is, has first member\'s name and second member\'s first name.';
// const helpMessage = 'If you would like to start a game, say Start blank game. If you would like to resume your last game, please say Resume blank game';
const helpMessage = 'Since we only have one game, Sheng Ji, please start off by saying Team one, or which ever number it is, has first member\'s name and second member\'s first name.';
var allTeams = [];
var currKing = false;

//HasTeamLaunchRequestHandler
const HasTeamLaunchRequestHandler = {
    canHandle(handlerInput) {
        console.log('In HasTeamHandler, in canHandle');
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const firstMemberOne = sessionAttributes.hasOwnProperty('firstMemberOne') ? sessionAttributes.firstMemberOne : 0;
        const firstMemberTwo = sessionAttributes.hasOwnProperty('firstMemberTwo') ? sessionAttributes.firstMemberTwo : 0;
        const secondMemberOne = sessionAttributes.hasOwnProperty('secondMemberOne') ? sessionAttributes.secondMemberOne : 0;
        const secondMemberTwo = sessionAttributes.hasOwnProperty('secondMemberTwo') ? sessionAttributes.secondMemberTwo : 0;

        console.log('Inside HasTeamLaunchRequest Handler ', firstMemberOne, ' ', firstMemberTwo, ' ', secondMemberOne, ' ', secondMemberTwo);

        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' && 
        firstMemberOne && 
        firstMemberTwo && 
        secondMemberOne &&
        secondMemberTwo;
    },
    async handle(handlerInput) {
        console.log('It seems that there was a previously saved game');

        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const firstMemberOne = sessionAttributes.hasOwnProperty('firstMemberOne') ? sessionAttributes.firstMemberOne : 0;
        const firstMemberTwo = sessionAttributes.hasOwnProperty('firstMemberTwo') ? sessionAttributes.firstMemberTwo : 0;
        const secondMemberOne = sessionAttributes.hasOwnProperty('secondMemberOne') ? sessionAttributes.secondMemberOne : 0;
        const secondMemberTwo = sessionAttributes.hasOwnProperty('secondMemberTwo') ? sessionAttributes.secondMemberTwo : 0;

        // const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
        // const deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope); /* This is an alternative to the above line using the Amazon SDK */

        let speakOutput = `Welcome back Team One, ${firstMemberOne}, ${firstMemberTwo}, and Team Two, ${secondMemberOne}, ${secondMemberTwo}, I hope you guys have a wonderful Sheng Ji match.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            // .reprompt(repromptText)
            .getResponse();
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    }, 
    handle(handlerInput) {
        const repromptText = 'Team One has Alexa and Jeff. What about your team?'
        
        return handlerInput.responseBuilder
            .speak(welcomeMessage)
            .reprompt(repromptText)
            .getResponse();
    }
};

const TeamIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TeamIntent';
    },
    async handle(handlerInput) {
        var teamCode = false;
        var bool;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.TeamNumber.value === 'undefined') {
            console.log('user did not input a team number');
        } else {
            teamCode = handlerInput.requestEnvelope.request.intent.slots.TeamNumber.value;
            console.log('teamCode is ', teamCode);
            bool = true;
        }

        var oneTeam = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.TeamMemberOne.value === 'undefined') {
            console.log('user did not input a team number');
        } else {
            oneTeam = handlerInput.requestEnvelope.request.intent.slots.TeamMemberOne.value;
            console.log('oneTeam is ', oneTeam);
        }

        var twoTeam = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.TeamMemberTwo.value === 'undefined') {
            console.log('user did not input a team number');
        } else {
            twoTeam = handlerInput.requestEnvelope.request.intent.slots.TeamMemberTwo.value;
            console.log('twoTeam is ', twoTeam);
            console.log('TeamNumber is ' + teamCode + ' and first team member is ' + oneTeam + ' and second teamMember is ' + twoTeam);
        }

        var king = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.KingName.value === 'undefined') {
            console.log('user did not input who is the king here');
        } else {
            king = handlerInput.requestEnvelope.request.intent.slots.KingName.value;
            console.log('King is ', king);
            if (!currKing) {
                currKing = king;
            }
        }

        var roundScore = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.RoundScore.value === 'undefined') {
            console.log('user did not input the round score');
        } else {
            roundScore = handlerInput.requestEnvelope.request.intent.slots.RoundScore.value;
            console.log('Round Score is ', roundScore);
        }
        
        const attributesManager = handlerInput.attributesManager;

        if (twoTeam !== false) {
            var team = {
                codeTeam: teamCode,
                teamOne: oneTeam,
                teamTwo: twoTeam
            };
            allTeams.push(team);
            console.log('Team counter is currently ', allTeams.length);
        }

        if (allTeams.length >= 2) {
            //Goes ahead and grabs the opposing team
            var originalMemberOne;
            var originalMemberTwo;
            for(var i = 0; i < allTeams.length; i++) {
                console.log('i is ', i, ' allTeams[i].codeTeam is ', allTeams[i].codeTeam);
                if (allTeams[i].codeTeam == 1) {
                    originalMemberOne = allTeams[i].teamOne;
                    originalMemberTwo = allTeams[i].teamTwo;
                }
            }
            console.log('originalMemberOne is ', originalMemberOne);
            console.log('originalMemberTwo is ', originalMemberTwo);

            //Sets the actual team attribute, firstMemberOne means first team, member one
            let teamAttributes = {
                "firstMemberOne": originalMemberOne,
                "firstMemberTwo": originalMemberTwo,
                "secondMemberOne": oneTeam,
                "secondMemberTwo": twoTeam 
            }

            console.log('teamAttributes is ', teamAttributes);

            attributesManager.setPersistentAttributes(teamAttributes);
            await attributesManager.savePersistentAttributes();
            console.log('Attributes Manager' + attributesManager);

            /* These are all straight up undefined */
            // console.log('attributesManager.firstMemberOne is ', attributesManager.firstMemberOne);
            // console.log('attributesManager.firstMemberTwo is ', attributesManager.firstMemberTwo);
            // console.log('attributesManager.secondMemberOne is', attributesManager.secondMemberOne);
            // console.log('attributesManager.secondMemberTwo is ', attributesManager.secondMemberTwo);

        }

        var speakOutput = `So far nothing`;
        var repromptText = `Interestingly empty`;
        if (twoTeam !== false && (typeof twoTeam !== 'undefined') && bool) {
            speakOutput = `Understood. Good luck team ${teamCode}. May ${oneTeam} and ${twoTeam} be dealt good hands.`;
            if (allTeams.length === 2) {
                speakOutput = speakOutput + ` It seems that you have a full game. Just say Alexa Exit, and when you reopen Alexa you should be able to begin the match. We only allow two teams, so if you keep adding they will not be saved.`;
            }
            repromptText = 'Sorry, but Alexa does not accept those two names, please give two nicknames.';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};

// const KingIntenthandler = {
//     canHandle(handlerInput) {
//         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//         && handlerInput.requestEnvelope.request.intent.name === 'KingIntent';
//     },
//     handle(handlerInput) {
//         const name = handlerInput.requestEnvelope.request.intent.slots.KingName.value;
//         if ()


//     }
// };

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoadTeamInterceptor = {
    async process(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

        const firstMemberOne = sessionAttributes.hasOwnProperty('firstMemberOne') ? sessionAttributes.firstMemberOne : 0;
        const firstMemberTwo = sessionAttributes.hasOwnProperty('firstMemberTwo') ? sessionAttributes.firstMemberTwo : 0;
        const secondMemberOne = sessionAttributes.hasOwnProperty('secondMemberOne') ? sessionAttributes.secondMemberOne : 0;
        const secondMemberTwo = sessionAttributes.hasOwnProperty('secondMemberTwo') ? sessionAttributes.secondMemberTwo : 0;

        if (firstMemberOne && firstMemberTwo && secondMemberOne && secondMemberTwo) {
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .withApiClient(
        new Alexa.DefaultApiClient()
    )
    .withPersistenceAdapter(
        /* This code makes it so we are using the persistence adapter and able to connect to the database */
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
        /* Check to see if order matters here or like at the beginning in order of that (27:35) of video */
        HasTeamLaunchRequestHandler,
        LaunchRequestHandler,
        TeamIntentHandler,
        // KingIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .addRequestInterceptors(
        /* This whole "addRequestInterceptors" was added here so we can create an interceptor that will make a single query once per run
        instead of constantly trying to access this data every time you run it in canHandle and handle */
        LoadTeamInterceptor
    )
    .lambda();
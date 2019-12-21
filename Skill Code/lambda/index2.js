/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

// IMPORTANT: Please note that this template uses Dispay Directives,
// Display Interface for your skill should be enabled through the Amazon developer console
// See this screenshot - https://alexa.design/enabledisplay

const Alexa = require('ask-sdk-core');

const numberOfGames = 1;
const welcomeMessage = 'Welcome to the Family Games Alexa App. Currently we have ' + numberOfGames + ' games available to play.';
// const helpMessage = 'If you would like to start a game, say Start blank game. If you would like to resume your last game, please say Resume blank game';
const helpMessage = 'Since we only have one game, Sheng Ji, please start off by saying Team one, or which ever number it is, has first member\'s name and second member\'s first name.';
var teamCounter = 0;
var allTeams = [];

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === `LaunchRequest`;
  },
  handle(handlerInput) {
    const repromptText = 'Team One has Alexa and Jeff. What about your team?'
      
    return handlerInput.responseBuilder
      .speak(welcomeMessage)
      .reprompt(repromptText)
      .getResponse();
  },
};

const TeamIntent = {
    canhandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TeamIntent';
    },
    handle(handlerInput) {
        const teamCode = handlerInput.requestEnvelope.request.intent.slots.teamnumber.value;
        const oneTeam = handlerInput.requestEnvelope.request.intent.slots.teammemberone.value;
        var twoTeam;
        teamCounter++;
        console.log('TeamNumber is ' + teamCode + ' and first team member is ' + oneTeam + ' and second teamMember is ' + twoTeam);
        
        //Check to see if the user inputted a TeamMemberTwo slot (since it's not required)
        if (handlerInput.requestEnvelope.request.intent.slots.teammembertwo.value !== null) {
            twoTeam = handlerInput.requestEnvelope.request.intent.slots.teammembertwo.value;
            twoTeam = ' and ' + twoTeam;
        }
        
        const speakOutput = `Understood. Good luck team ${teamCode}. May ${oneTeam} ${twoTeam} be dealt good hands`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FirstKingIntent = {
    canhandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FirstKingIntent';
    },
    handle(handlerInput) {
        const teamNumber = handlerInput.requestEnvelope.request.intent.slots.teamnumber.value;
        const king = handlerInput.requestEnvelope.request.intent.slots.kingname.value;
        
        const speakOutput = `Nice job ${king} from team ${teamNumber}. Good luck this round and defeat the other ${teamCounter} teams.`
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = helpMessage;

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

const ErrorHandler = {
  canHandle() {
    console.log("Inside ErrorHandler");
    return true;
  },
  handle(handlerInput, error) {
    console.log("Inside ErrorHandler - handle");
    console.log(`Error handled: ${JSON.stringify(error)}`);
    console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);

    return handlerInput.responseBuilder
      .speak("This is an error wtf")
    //   .reprompt(helpMessage)
      .getResponse();
  },
};

/* CONSTANTS */
const skillBuilder = Alexa.SkillBuilders.custom();

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    TeamIntent,
    FirstKingIntent,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

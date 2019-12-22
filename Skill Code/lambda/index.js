// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

const numberOfGames = 1;
var welcomeMessage = 'Welcome to the Family Games Alexa App. Currently we have ' + numberOfGames + ' game available to play, Sheng Ji.';
welcomeMessage = welcomeMessage + ' That means we only have Sheng Ji to play, please start off by saying Team one, or which ever number it is, has first member\'s name and second member\'s first name.';
welcomeMessage = welcomeMessage + ' If you have any issues, simply say: Help me. Then, I will give you the help message tutorial.';
// const helpMessage = 'If you would like to start a game, say Start blank game. If you would like to resume your last game, please say Resume blank game';
const helpMessage = `If you are having troubles telling me the team members, then start off by saying Team one, or which ever number it is, has first member\'s name and second member\'s first name.
 Here are some instructions after you have told me the team members. ${instructions} Before you begin by saying the number of points, make sure to tell me who the first king is. ${firstKingInstructions} I hope I answered your questions, and good luck!`;
var allTeams = [];
var alreadyHeardInstructions = false;
var orderGiven = false;
var order = [];
var orderIndex = -1;

//All of these variables are dedicated to after all of the inputs have been taken, and now only round score is needed for each round
var cardOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
var teamOneCardOrder = 0;
var teamTwoCardOrder = 0;
var currKingTeam = -1;
var gameOver = false;

var globalFirstMemberOne = false;
var globalFirstMemberTwo = false;
var globalSecondMemberOne = false;
var globalSecondMemberTwo = false;
var global = false;
var firstGlobal = false;

var rotationInstructions = `Now, please tell me the order of rotation, for example John, then if John's team loses, proceeds to Karen being new King, if Karen's team loses, then Amy is new King, etc. Please say: The order of rotation is player one player two player three and player four. I will track it in that order, knowing that player one and player three are on a team, and the others are on the other team.`
var firstKingInstructions = `Just say: blank, or whoever he first king is, is the first king. For example: Jeff is the first king.`;
var instructions = `${rotationInstructions} Then, proceed to tell me who is the first king. ${firstKingInstructions} Finally, continue with the match by saying how many points were earned per round.
If you ever want to restart the match, say: Please restart my match. If you the attacker team just used a jack to defeat the previous king team, say Team Number just jacked the kings, with the only thing to change is Team Number replacing it with something like Team One.`;

var launchBool = false;
const LaunchRequestHandler = {
    canHandle(handlerInput) {

        console.log('In HasTeamHandler, in canHandle');
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const firstMemberOne = sessionAttributes.hasOwnProperty('firstMemberOne') ? sessionAttributes.firstMemberOne : 0;
        const firstMemberTwo = sessionAttributes.hasOwnProperty('firstMemberTwo') ? sessionAttributes.firstMemberTwo : 0;
        const secondMemberOne = sessionAttributes.hasOwnProperty('secondMemberOne') ? sessionAttributes.secondMemberOne : 0;
        const secondMemberTwo = sessionAttributes.hasOwnProperty('secondMemberTwo') ? sessionAttributes.secondMemberTwo : 0;
        const gaveAnOrder = sessionAttributes.hasOwnProperty('gaveAnOrder') ? sessionAttributes.gaveAnOrder : 0;
        console.log('gaveAnOrder is', gaveAnOrder);
        const restarted = sessionAttributes.hasOwnProperty('restarted') ? sessionAttributes.restarted : 0;

        console.log('Inside HasTeamLaunchRequest Handler ', firstMemberOne, ' ', firstMemberTwo, ' ', secondMemberOne, ' ', secondMemberTwo);
        console.log('Inside Launcher, restarted is ', restarted);

        const firstTeamsScore = sessionAttributes.hasOwnProperty('firstTeamScore') ? sessionAttributes.firstTeamScore : 0;
        const secondTeamsScore = sessionAttributes.hasOwnProperty('secondTeamScore') ? sessionAttributes.secondTeamScore : 0;
        const orderOfDaCurrentKing = sessionAttributes.hasOwnProperty('daCurrentKing') ? sessionAttributes.daCurrentKing : 0;

        if (!restarted) {
            if (firstMemberOne && firstMemberTwo && secondMemberOne && secondMemberTwo) {
                console.log('I cannot believe it, everything is fuking true');
                firstGlobal = true;
                global = true;
                globalFirstMemberOne = firstMemberOne;
                globalFirstMemberTwo = firstMemberTwo;
                globalSecondMemberOne = secondMemberOne;
                globalSecondMemberTwo = secondMemberTwo;
            }

            if (typeof gaveAnOrder !== 'undefined') {
                orderGiven = false; 
            } else {
                orderGiven = true;
            }

            if ((typeof firstTeamsScore !== 'undefined') && (typeof secondTeamsScore !== 'undefined') && (typeof orderOfDaCurrentKing !== 'undefined')) {
                launchBool = true;
                order = [globalFirstMemberOne, globalSecondMemberOne, globalFirstMemberTwo, globalSecondMemberTwo];
                orderGiven = true;
                teamOneCardOrder = firstTeamsScore;
                teamTwoCardOrder = secondTeamsScore;
                orderIndex = orderOfDaCurrentKing;
                if ((orderIndex % 2) == 0) {
                    currKingTeam = 1;
                } else {
                    currKingTeam = 2;
                }
                welcomeMessage = `Welcome back! I am automatically resuming your last match. The order is
                ${order[0]}, followed by ${order[1]}, followed by ${order[2]}, and then finally followed by ${order[3]}.
                Currently the team that is the current king is ${currKingTeam} and ${order[orderIndex]} is currently playing the king.
                Team one is playing the ${cardOrder[teamOneCardOrder]} level and team two is playing the ${cardOrder[teamTwoCardOrder]} level.
                Good luck to both teams in your current match.
                `;
            }
        }

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    }, 
    handle(handlerInput) {
        const repromptText = 'Team One has Alexa and Jeff. What about your team?'
        if (firstGlobal && !global) {
            welcomeMessage = `Welcome back! We have already saved team one, with ${globalFirstMemberOne} and ${globalFirstMemberTwo} on the team.
            ${instructions}`;
        } else if (launchBool) {
            order = [globalFirstMemberOne, globalSecondMemberOne, globalFirstMemberTwo, globalSecondMemberTwo];
            orderGiven = true;
            if ((orderIndex % 2) == 0) {
                currKingTeam = 1;
            } else {
                currKingTeam = 2;
            }
            welcomeMessage = `Welcome back! I am automatically resuming your last match. The order is
            ${order[0]}, followed by ${order[1]}, followed by ${order[2]}, and then finally followed by ${order[3]}.
            Currently the team that is the current king is ${currKingTeam} and ${order[orderIndex]} is currently playing the king.
            Team one is playing the ${cardOrder[teamOneCardOrder]} level and team two is playing the ${cardOrder[teamTwoCardOrder]} level.
            Good luck to both teams in your current match.
            `;
        } else {
            if (typeof gaveAnOrder !== 'undefined') {
                orderGiven = true;
            }

            if (!orderGiven) {
                welcomeMessage = `Welcome back! We already have a full match saved, with the players on team 1 being ${globalFirstMemberOne}, 
                ${globalFirstMemberTwo}, and the players on team 2 being ${globalSecondMemberOne}, and ${globalSecondMemberTwo}.,
                ${rotationInstructions} ${instructions}`
            } else {
                welcomeMessage = `Welcome back! We already have a full match saved, with the players on team 1 being ${globalFirstMemberOne}, 
                ${globalFirstMemberTwo}, and the players on team 2 being ${globalSecondMemberOne}, and ${globalSecondMemberTwo}.,
                ${instructions}`
            }
        }

        return handlerInput.responseBuilder
            .speak(welcomeMessage)
            .reprompt(repromptText)
            .getResponse();
    }
};

var nextRoundMessage = false;
var nextRoundBool = false;
function nextRound(score) {
    if (allTeams.length < 2) {
        nextRoundMessage = `Please input all the teams, like team one has Jeff and Bezos`;
    } else if (!orderGiven) {
        console.log('Bruh moment, did not give the order. orderGiven is', orderGiven);
        nextRoundMessage = `Please give the order. ${rotationInstructions}. Afterwards, tell me the score once again`
    } else if (orderIndex == -1) {
        nextRoundMessage = `Please give the first king. ${firstKingInstructions}`
    } else if (gameOver) {
        nextRoundMessage = `The match is already over. Say: please restart my match to begin anew.`;
    } else {
        var skips = Math.floor(score/40);
        skips -= 2;
        if (skips < 0) {
            skips = Math.abs(skips);
            nextRoundBool = true;

            nextRoundMessage = `Congratulations current kings, you have managed to hold onto your throne. 
            You are going up ${Math.abs(skips)} levels.`;
            
            //Getting the next King based off order index
            if (orderIndex == 2) {
                orderIndex = 0;
            } else if (orderIndex == 3) {
                orderIndex = 1;
            } else {
                orderIndex += 2;
            }

            nextRoundMessage += ` ${order[orderIndex]} is going to be the next king.`
            
            //Skipping the original king team
            if (currKingTeam == 1) {
                teamOneCardOrder += skips;
                if (teamOneCardOrder >= cardOrder.length) {
                    gameOver = true;
                    nextRoundMessage = `Congratulations Team One for winning the match. ${globalSecondMemberOne} and ${globalSecondMemberTwo} better luck next time. In order to restart and play a new match, simply say: Please restart my match.`;
                } else {
                    nextRoundMessage += ` ${order[orderIndex]} is going to be the next king playing the ${cardOrder[teamOneCardOrder]} round.`;
                }
            } else {
                teamTwoCardOrder += skips;
                if (teamTwoCardOrder >= cardOrder.length) {
                    gameOver = true;
                    nextRoundMessage = `Congratulations Team Two for winning the match. ${globalFirstMemberOne} and ${globalFirstMemberTwo} better luck next time. In order to restart and play a new match, simply say: Please restart my match.`;
                } else {
                    nextRoundMessage += ` ${order[orderIndex]} is going to be the next king playing the ${cardOrder[teamTwoCardOrder]} round.`;
                }
            }

        } else if (skips == 0) {
            nextRoundBool = true;

            nextRoundMessage = `Congratulations attackers, you have usurped the kings. However, you did not receive the necessary
            120 points or more to skip a level or multiple levels.`

            //Getting the next King based off order index
            if (orderIndex == 3) {
                orderIndex = 0;
            } else {
                orderIndex += 1;
            }

            nextRoundMessage += ` ${order[orderIndex]} is going to be the next king.`
            
            //Changing the currKingTeam
            if (currKingTeam == 1) {
                currKingTeam = 2;
                nextRoundMessage += ` ${order[orderIndex]} is going to be the next king playing the ${cardOrder[teamTwoCardOrder]} round.`;
            } else {
                currKingTeam = 1;
                nextRoundMessage += ` ${order[orderIndex]} is going to be the next king playing the ${cardOrder[teamOneCardOrder]} round.`;
            }

        } else if (skips > 0) {
            nextRoundBool = true;

            nextRoundMessage = `Congratulations attackers, you have usurped the king and skipped ${skips} levels.`
            
            //Getting the next King based off order index
            if (orderIndex == 3) {
                orderIndex = 0;
            } else {
                console.log('Inside before else order, orderIndex is', orderIndex);
                orderIndex = orderIndex + 1;
                console.log('Inside else order index for skip > 0. orderIndex is now', orderIndex);
            }

            //Changing currKingTeam and skipping the attacking team
            if (currKingTeam == 1) {
                teamTwoCardOrder += skips;
                currKingTeam = 2;
                if (teamTwoCardOrder >= cardOrder.length) {
                    gameOver = true;
                    nextRoundMessage = `Congratulations Team Two for winning the match. ${globalFirstMemberOne} and ${globalFirstMemberTwo} better luck next time. In order to restart and play a new match, simply say: Please restart my match.`;
                } else {
                    nextRoundMessage += ` ${order[orderIndex]} is going to be the next king playing ${cardOrder[teamTwoCardOrder]} round.`;
                }

            } else {
                teamOneCardOrder += skips;
                currKingTeam = 1;
                if (teamOneCardOrder >= cardOrder.length) {
                    gameOver = true;
                    nextRoundMessage = `Congratulations Team One for winning the match. ${globalSecondMemberOne} and ${globalSecondMemberTwo} better luck next time. In order to restart and play a new match, simply say: Please restart my match.`;
                } else {
                    nextRoundMessage += ` ${order[orderIndex]} is going to be the next king playing ${cardOrder[teamOneCardOrder]} round.`;
                }
            }

        }
        console.log('orderIndex is ', orderIndex);
    }

    console.log('nextRoundMessage is ', nextRoundMessage);
};

const TeamIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TeamIntent';
    },
    async handle(handlerInput) {
        var speakOutput = `Thank you for the input`;
        
        var teamCode = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.TeamNumber.value === 'undefined') {
            console.log('user did not input a team number');
        } else {
            teamCode = handlerInput.requestEnvelope.request.intent.slots.TeamNumber.value;
            console.log('teamCode is ', teamCode);
        }

        var jackedUp = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.Jacked.value === 'undefined') {
            console.log('this was not a jack round');
        } else {
            let daValue = handlerInput.requestEnvelope.request.intent.slots.TeamNumber.value;
            console.log('daValue is', daValue);
            if (daValue == 'Jacked' || daValue == 'jacked' || daValue == 'jack' || daValue == 'Jack') {
                if (teamCode == 1) {
                    speakOutput = `Congratulations Team One for jacking Team Two. It really sucks Team Two, but I'm bringing you down to 2.`;
                    teamTwoCardOrder = 0;

                } else if (teamCode == 2) {
                    speakOutput = `Congratulations Team Two for jacking Team One. It really sucks Team One, but I'm bringing you down to 2.`;
                    teamOneCardOrder = 0;

                } else {
                    speakOutput = `I'm sorry, I didn't quite catch which team jacked which team. Please tell me in this order: Attacking team number just Jacked the kings.`
                }
            }
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

        var roundScore = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.RoundScore.value === 'undefined') {
            console.log('user did not input the round score');
        } else {
            roundScore = handlerInput.requestEnvelope.request.intent.slots.RoundScore.value;
            console.log('Round Score is ', roundScore);
            nextRound(roundScore);
            speakOutput = `Thank you for telling me the round score, I got that the round score is ${roundScore}.`;
        }

        /* Beginning of me tracking all of the players */
        var playerOne = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.PlayerOne.value === 'undefined') {
            console.log('user did not input a player One');
        } else {
            orderGiven = true;
            playerOne = handlerInput.requestEnvelope.request.intent.slots.PlayerOne.value;
            console.log('Player One is  ', playerOne);
        }
        
        var playerTwo = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.PlayerTwo.value === 'undefined') {
            console.log('user did not input a player Two');
        } else {
            orderGiven = true;
            playerTwo = handlerInput.requestEnvelope.request.intent.slots.PlayerTwo.value;
            console.log('Player Two is  ', playerTwo);
        }

        var playerThree = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.PlayerThree.value === 'undefined') {
            console.log('user did not input a player Three');
        } else {
            orderGiven = true;
            playerThree = handlerInput.requestEnvelope.request.intent.slots.PlayerThree.value;
            console.log('Player Three is  ', playerThree);
        }

        var playerFour = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.PlayerFour.value === 'undefined') {
            console.log('user did not input a player Four');
        } else {
            orderGiven = true;
            playerFour = handlerInput.requestEnvelope.request.intent.slots.PlayerFour.value;
            console.log('Player Four is  ', playerFour);
        }

        /* End of me tracking all of the players */
        
        var king = false;
        if (typeof handlerInput.requestEnvelope.request.intent.slots.KingName.value === 'undefined') {
            console.log('user did not input who is the king here');
        } else {
            king = handlerInput.requestEnvelope.request.intent.slots.KingName.value;
            console.log('King is ', king);
            if (orderGiven || order.length == 4) {
                for (let i = 0; i < order.length; i++) {
                    if (order[i] == king) {
                        orderIndex = i;
                        console.log('orderIndex is', orderIndex);

                        //This sets the current King team to whichever team has the first king
                        if (orderIndex % 2 == 0) {
                            currKingTeam = 1;
                        } else {
                            currKingTeam = 2;
                        }
                        
                    }
                }
                speakOutput = `Thank you for inputting the king. Both teams will be starting at 2.`;
            } else {
                speakOutput = `Please give the order before telling me the king`;
            }
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

        if (playerFour !== false) {
            order.push(playerOne, playerTwo, playerThree, playerFour);
        }

        if (allTeams.length >= 2) {
            //Goes ahead and grabs the opposing team
            var originalMemberOne;
            var originalMemberTwo;
            for(let i = 0; i < allTeams.length; i++) {
                console.log('i is ', i, ' allTeams[i].codeTeam is ', allTeams[i].codeTeam);
                if (allTeams[i].codeTeam == 1) {
                    originalMemberOne = allTeams[i].teamOne;
                    originalMemberTwo = allTeams[i].teamTwo;
                }
            }
            console.log('originalMemberOne is ', originalMemberOne);
            console.log('originalMemberTwo is ', originalMemberTwo);

            //Sets the actual team attribute, firstMemberOne means first team, member one
            let teamAttributes;
            if (!orderGiven) {
                teamAttributes = {
                    "firstMemberOne": originalMemberOne,
                    "firstMemberTwo": originalMemberTwo,
                    "secondMemberOne": oneTeam,
                    "secondMemberTwo": twoTeam,
                    "restarted": false
                }
            } else if (orderGiven) {
                teamAttributes = {
                    "firstMemberOne": globalFirstMemberOne,
                    "firstMemberTwo": globalFirstMemberTwo,
                    "secondMemberOne": globalSecondMemberOne,
                    "secondMemberTwo": globalSecondMemberTwo,
                    "gaveAnOrder": true,
                    "restarted": false
                    //Could also say "gaveAnOrder": orderGiven
                }
            }

            console.log('teamAttributes is ', teamAttributes);

            attributesManager.setPersistentAttributes(teamAttributes);
            await attributesManager.savePersistentAttributes();
            console.log('Attributes Manager' + attributesManager);

        }

        if (nextRoundMessage !== false) {
            console.log('nextRoundMessage is not false. It is', nextRoundMessage);
            speakOutput = nextRoundMessage;
            if (nextRoundBool) {
                let teamAttributes = {
                    "firstMemberOne": globalFirstMemberOne,
                    "firstMemberTwo": globalFirstMemberTwo,
                    "secondMemberOne": globalSecondMemberOne,
                    "secondMemberTwo": globalSecondMemberTwo,
                    "gaveAnOrder": true,
                    "restarted": false,
                    "firstTeamScore": teamOneCardOrder,
                    "secondTeamScore": teamTwoCardOrder,
                    "daCurrentKing": orderIndex
                }
                console.log('daCurrentKing here is', teamAttributes.daCurrentKing);

                attributesManager.setPersistentAttributes(teamAttributes);
                await attributesManager.savePersistentAttributes();
            }
        }

        var repromptText = `Interestingly empty`;
        if (twoTeam !== false && (typeof twoTeam !== 'undefined') && !alreadyHeardInstructions) {
            speakOutput = `Understood. Good luck team ${teamCode}. May ${oneTeam} and ${twoTeam} be dealt good hands.`;
            if (allTeams.length === 2) {
                alreadyHeardInstructions = true;
                if (!orderGiven) {
                    speakOutput = speakOutput + ` It seems that you have a full game. ${rotationInstructions} ${instructions} If you leave or exit Alexa in the middle of the game,
                    worry not since we will save the match for you.`;
                } else {
                    speakOutput = speakOutput + ` It seems that you have a full game. ${instructions} If you leave or exit Alexa in the middle of the game,
                    worry not since we will save the match for you.`;
                }
            }
            repromptText = 'Sorry, but Alexa does not accept those two names, please give two nicknames.';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(helpMessage)
            .reprompt(helpMessage)
            .getResponse();
    }
};

const StartOverIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent';
    },
    async handle(handlerInput) {
        var speakOutput = `I am initiating the match restarting mechanism. Everything will be cleared.`
        speakOutput += ` It will take a few minutes to officially process. If you make new teams, the new teams will be saved, but the next
        time you open up the welcome message will act as if there is a saved match.`;

        let teamAttributes = {
            "firstMemberOne": false,
            "restarted": true
        }

        const attributesManager = handlerInput.attributesManager;

        attributesManager.setPersistentAttributes(teamAttributes);
        await attributesManager.savePersistentAttributes();

        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

        const secondMemberOne = sessionAttributes.hasOwnProperty('secondMemberOne') ? sessionAttributes.secondMemberOne : 0;
        if (!secondMemberOne) {
            console.log('Definitive, secondMemberOne does not exist, it is', secondMemberOne);
        } else {
            console.log('secondMemberOne exists');
        }

        //Wish I saw this earlier lol
        attributesManager.deletePersistentAttributes();

        /* LOL I'm done with this, just straight up resetting everything */
        allTeams = [];
        alreadyHeardInstructions = false;
        orderGiven = false;
        order = [];
        orderIndex = -1;
        
        globalFirstMemberOne = false;
        globalFirstMemberTwo = false;
        globalSecondMemberOne = false;
        globalSecondMemberTwo = false;
        global = false;
        firstGlobal = false;

        teamOneCardOrder = 0;
        teamTwoCardOrder = 0;
        currKingTeam = -1;

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
        LaunchRequestHandler,
        TeamIntentHandler,
        HelpIntentHandler,
        StartOverIntentHandler,
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
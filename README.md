# Family Games

A fun Alexa app to manage family game night. As of right now, only supports one game, Sheng Ji.

## Getting Started

These instructions will get you to speed about the project

### Detailed Description

This app currently only supports one card game, Sheng Ji (with a maximum of two teams of two people).
Link: https://en.wikipedia.org/wiki/Sheng_ji

This app first has you enter the two conflicting teams, their number and then their members. Please only use Team One and Team Two. 

Then the application will ask you for the order of rotation, meaning in your table after one person gets knocked down, who will be the next king, and keep going for the cycle until all four people are accounted for.

Afterwards the application will ask you for whoever the first king is. It will assume that the first person in the order of rotation is the first king if this is not inputted, but you should input it.

After that, for every round simply say how many points were earned in the round and my application will tell you who is the next king and what round (number) they are playing.

If the king is on Jack, and the attacking team jacks the kings back, simply say Team ___ (one or two) has jacked the kings. Afterwards, say the score to switch kings. If the score was under 80, do not say the score.

The application will auto-save matches and will auto-play matches if you tell the application to exit before the match is over. If you would like to restart the match, maybe with new teams or simply just to restart, say "Please restart my match".

I hope you have a good time using my application.

### Sample Script

All User Inputs (different lines mean different interaction):
Hey Alexa, open family games.

team one has john and jack

team two has anna and sarah

the order of rotation is john anna jack sarah
john is the first king

440 points were earned

440 points were earned

team two has jacked the kings

120 points were earned

40 points were earned

30 points were earned

Alexa: "Congratulations to team two for winning..."

User: "Restart my match."

## Categories

Games

## Keywords:
games, cards, cardgames, family, familygames, shengji

## Built With

* [Alexa Developer Console](https://developer.amazon.com) - The web framework used
* [NodeJS](https://nodejs.org/en/) - The Backend

## Authors

* **klxu03** - *All of the work* - [klxu03](https://github.com/klxu03)

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments

* Kevin Higgs for being a personal Google

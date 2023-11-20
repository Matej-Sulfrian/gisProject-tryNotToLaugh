# GIS Praktikum Game project WiSe2023/24

## Try not to laugh

### Description

This is a "try not to laugh" game demo that uses [smile-detection](https://github.com/SeeknnDestroy/smile-detection) and [JokeAPI](https://sv443.net/jokeapi/v2/) to display random jokes and detect whether the user is smiling or not. If so you lose a life.
The basic demo is a single player game, restricted to 5 lives and 10 jokes.

### Live Demo

You can try out the game [here](https://matej-sulfrian.github.io/gisProject-tryNotToLaugh/game/tryNotToLaugh.html). Simply allow webcam access and start smile detection!

### How to Play

1. Allow the application to access your webcam.
2. You will see your video feed on the top right of thr screen along with 5 red hearts.
3. Click the "Start" button to start the smile detection.
4. Start reading the joke in the center of the screen.
5. Click next when finished.
6. If you smile, you will lose a life.

## Todos

### Bugs
#### 1. There is now clear start point for the game. Creat one single button to start the game:
   - Start smile detection
   - Show first joke
#### 2. There is no way to win or lose a game:
   - Feedback when all lives or gone; **lose**
   - Feedback when all jokes are done and there are still some lives left; **win**
   - Stop smile detection
   
#### 3. There is no way to restart the game:
   - **when finished**: Restart button in win or lose feedback message (this is optional - feedback message can be simply closed without restarting the game as well)
   - **while playing**: Restart button in the hud (already exists but doesn't work correctly, see point three)
   - **on restart**: restart smile detection

### Extensions
#### 1. Give it a new look
   - New background idea
   - New layout
   - Different colors, fonts, icons etc.
   - New or different CSS animations

#### 2. Add game settings
   - Amount of available lives
   - Amount of jokes ([JokeAPI](https://sv443.net/jokeapi/v2/))
   - Joke categories ([JokeAPI](https://sv443.net/jokeapi/v2/))
   - More settings you like or finde on [JokeAPI](https://sv443.net/jokeapi/v2/)

#### 3. Make it a multiplayer
   - Add a setting to switch between multi- and single player
   - Check out the [demo version](https://seeknndestroy.github.io/smile-detection/) from smile-detection (it's capable of tracking 2 people)
   - Start up the demo version locally by opening `smileDetection/index.html` from your project root
   - Check out the `smile-detection.js` file and try to understand how the two face tracking works


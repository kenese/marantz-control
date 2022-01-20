# marantz-control
A server that lets you send commands to your Marantz receiver (and apparently works with Denon receivers). 
The receiver control is pinched from https://github.com/ntotten/marantz-avr with the addition of adding the ability to target Zones 2 and 3. I also refactored it to use a bit more modern JS.

The idea of this repo is to create a webhook that IFTTT can POST to so i can control the receiver with Google Assistant

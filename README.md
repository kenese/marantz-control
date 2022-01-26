# marantz-control
The idea of this repo is to create a cloud function/webhook that controls Marantz source and sound settings for multiple zones. I am using it with ~~IFTTT~~ IOS shortcuts, that fires instructions to our webhook.

The receiver control is pinched from https://github.com/ntotten/marantz-avr with the addition of adding the ability to target Zones 2 and 3, and a couple little 
changes as it wans't working as a cloud function. I also refactored it to use a bit more modern JS.

Add a file called "receiver-url.json" to the "functions" folder,  that contains your Marantz IP and port (or URL):
{
    "url": "123.456.789.890:58765" 
}

I am pushing this cloud function to firebase. Which is called from my IOS shortcut 

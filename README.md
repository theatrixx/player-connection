# xPressCue Connect

A simple library for interacting with the Theatrixx xPressCue, in the browser or in the server. Written in TypeScript.

## Installation

`npm i @theatrixx/xpresscue-connect`

## Usage

Always start by instantiating the base `Player` class. One `Player` class represents one physical xPressCue device.

```typescript
import { Player } from '@theatrixx/xpresscue-connect';

const player = new Player();

// Connect to the device
player.connect('192.168.2.21').then(() => {

  // Execute actions once connected.
  player.identify();
  player.stop();
});
```

Refer to the inline documentation for further information on all the methods available on the `Player` class.

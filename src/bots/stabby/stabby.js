/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */
import Damage from 'leftovers-again/game/damage';

import { MOVE, SWITCH } from 'leftovers-again/decisions';

var spawn = require('child_process').spawn;
var fs = require('fs');
var move = "Nothing yet";

export default class Stabby {

  constructor(){
    //this.py = spawn('python', ['../pokemonMDP/MDPDecider.py']);
  }

  decide(state) {
    this.py = spawn('python', ['../pokemonMDP/MDPDecider.py']);
    this.py.stdout.on('data', function(data){
      move = data.toString();
    });
    this.py.stdout.on('end', function(){
      process.stdout.write("Our stream closed!\n");
    });
    this.py.stdin.write(JSON.stringify(state) + '\n');
    this.py.stdin.end();
    this.py.stdin.read();
    process.stdout.write("Deciding...\n");
    if(move == "Nothing yet"){
      process.stdout.write("Didn't get anything yet\n");
    }else{
      process.stdout.write("Hey it worked!\n");
      process.stdout.write(move);
    }
    

    
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter( (mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }

    // check each move
    let maxDamage = -1;
    let bestMove = 0;

    state.self.active.moves.forEach((move, idx) => {
      if (move.disabled) return;
      let est = [];
      try {
        est = Damage.getDamageResult(
          state.self.active,
          state.opponent.active,
          move
        );
      } catch (e) {
        console.log(e);
        console.log(state.self.active, state.opponent.active, move);
      }
      if (est[0] > maxDamage) {
        maxDamage = est[0];
        bestMove = idx;
      }
    });

    return new MOVE(bestMove);
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

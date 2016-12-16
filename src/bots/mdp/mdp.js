/*
	Markov bot! it's da mdp
*/
import AI from 'leftovers-again/ai';
import { MOVE, SWITCH } from 'leftovers-again/decisions';
// import util from 'leftovers-again/pokeutil';

const fs = require('fs');

const pokemon_names = {
    "medicham" : 0,
    "hitmonlee" : 1,
    "jynx" : 2,
    "ludicolo" : 3,
    "weavile" : 4,
    "infernape" : 5,
  };

const pokemon_names_list = [
    "medicham",
    "hitmonlee",
    "jynx",
    "ludicolo",
    "weaville",
    "infernape"];

var policy = [];


var state_attribute_values = [pokemon_names.length+1, 4, 7, 7];

class mdpbot extends AI {
  
  constructor(){
    super();
    
    // load file with policy as array
    // The way I've set this up, there aren't states in there
    // I just use the adapted state to int method to find the right index
    fs.readFile('src/bots/mdp/policy.txt', 'utf8', function(err, data){
      if (err) {
        return console.log(err);
      }
      var lines = data.split('\n');
      var statestr = "";
      var attrs = [];
      var state = [];
      var action = -1;
      var i = 0;
      while(i < lines.length){
        action = parseInt(lines[i].split(':')[1]);
        policy.push(action);
        i = i + 1;
      }
    });
  }

  team() {
    return `
Medicham @ Leftovers
Ability: Pure Power
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Fake Out
- Psycho Cut
- High Jump Kick
- Ice Punch

Hitmonlee @ Salac Berry
Ability: limber
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Fake Out
- Endure
- Reversal
- Stone Edge

Jynx @ Focus Sash
Ability: Oblivious
EVs: 252 SpA / 4 SpD / 252 Spe
Jolly Nature
- Fake Out
- Lovely Kiss
- Ice Beam
- Fake Tears

Ludicolo @ Leftovers
Ability: Rain Dish
EVs: 252 SpA / 4 SpD / 252 Spe
Jolly Nature
- Fake Out
- Toxic
- Surf
- Rain Dance

Weavile @ Choice Band
Ability: Pickpocket
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Fake Out
- Night Slash
- Ice Shard
- Brick Break

Infernape @ Life Orb
Ability: Iron Fist
EVs: 136 Atk / 120 SpA / 252 Spe
Jolly Nature
- Fake Out
- Flare Blitz
- Stone Edge
- Close Combat`;
  }
  
  //Given a game state, look up the game states from mdp.py and find out what action to take, then return that action.
  decide(state) {

    if (state.forceSwitch || state.teamPreview) {
      const myMon = this.pickOne(
        state.self.reserve.filter(mon => !mon.dead)
      );
      return new SWITCH(myMon);
    }

    var code = this.encode(state);
    console.log(policy.length);
    var p = policy[code];
    console.log(p);
    if(p < 4){
      var move = new MOVE(p);
      if(move.disabled){ //Night slash is disabled????
        return new MOVE(2);
      }
      return new MOVE(p);
    }else{
      console.log(p)
      return new SWITCH(pokemon_names_list[p-4]);
    }
  }
  
  

  encode(state){
  	
  	var encoding = [];
  	if(state.self.active.length==0){ //If we have no active pokemon, skip this part?
      encoding.push(6);
      encoding.push(3);
  	}
  	else{
  		//Attach to encoding the pokemon's name
  		encoding.push(pokemon_names[state.self.active.id]);
  		//Attach to encoding the pokemon's hppct/50
      if(state.self.active.hppct == undefined){
        encoding.push((state.self.active.hp * 2 / state.self.active.maxhp) >> 0)
      }else{
  		  encoding.push(state.self.active.hppct/50>>0); //TODO need to convert this to rounded int.
      }
    }
		//Go through each reserve pokemon:
    encoding.push(6);
		for(var p = 0; p < pokemon_names.length; p++){
			var name = pokemon_names[p];
      if(state.self.active != []){
		    if(name.localeCompare(state.self.active.id)==0){
				  continue;
        }
			}
			for(var r = 0; r < state.self.reserve; r++){
				var rname = state.self.reserve[r];
				if(name.localeCompare(rname)==0){
					if(state.self.reserve[r].hppct==0){
						encoding[2] -= 1;
					}
				}
  			
  		}
  	}
  	encoding.push(6);
		//Go through each reserve pokemon:
		for(var p = 0; p < pokemon_names.length; p++){
			var name = pokemon_names[p];
			if(state.self.active != []){
          if(name.localeCompare(state.self.active.id)==0){
            continue;
			}}
			for(var r = 0; r < state.opponent.reserve; r++){
				var rname = state.opponent.reserve[r];
				if(name.localeCompare(rname)==0){
					if(state.opponent.reserve[r].hppct==0){
						encoding[3]-=1;
					}
				}
      }
    }
  	return this.state_to_int(encoding);
  }

  state_to_int(state){

    var index = 0;
    var stride = 1;
    for(var i = state_attribute_values.length-1; i >=0; i--){
      index += stride * state[i];
      stride *= state_attribute_values[i];
    }
    return index;
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}



export default mdpbot;
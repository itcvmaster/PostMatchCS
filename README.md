# PostMatchCS
## Description
The project is to estimate the following 6 stats based on json files being provided to Team Coaching Product.
- CS Count for Early Last Hit
- CS Count for Late Last Hit
- CS Count Lost by Turrent
- CS Gold for Early Last Hit
- CS Gold for Late Last Hit
- CS Gold Lost by Turrent

## Assumption
The json files should contain the following stats
- Champion: X, Y, Z, SummonerName, health, gold_total, minions, team
- Turret  : X, Y, Z, Health, team
- Minion  : X, Y, Z, name, health, team

## Run
node parseMinion.js input/total.json (or relative json path)
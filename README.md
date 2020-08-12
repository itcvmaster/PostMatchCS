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
- Champion: X, Y, Z, SummonerName, health, gold_total, minions, role, team
- Turret  : X, Y, Z, Health, team
- Minion  : X, Y, Z, name, health, team

## Run
```
$ node parseMinion.js json_file_path
> $ node parseMinion.js input/total.json
```

## Appendix: Detailed Explanation
### Appendix1: Finding Dead Minions
If minion is dead, its health becomes 0. And dead minions can last 2~3 seconds.

So to be a dead minion in current slice,
- Minion's Health in current slice should be 0.
- Mionon's Health in previous slice should be greater than 0.
- Minion's Team should be enemy Team, but not Netural. (For example, if a champion is ***Blue*** Team, a minion shouldn't be ***Blue*** or ***Netura***l Team, but only ***Red***.)
- Minion's name should contain ***Minion***, to filter out ***Wards***, ***Turret Kit of Heimerdinger*** and ***Tentacle of Illaoi*** (Optional)

### Appendix2: Matching Minions of current slice and previous slice
Minion's movement speed is 300.

So to match minions,
- Find closest minion within 300 units range.

### Appendix3: Getting Missing_Minions (Early Last hit + Late Last Hit).
CS Count for Early last Hit and for Late Last Hit is a number of minions dead around champion, but not killed by Champion.

In other words, 
```
Missed_CS_Count = Early_Last_Hit_Count + Late_Last_Hit_Count = Dead_Minion_Count - Champion_CS_Diff
```

Here, ***Chamion_CS_Diff*** is a number of minions killed by a champion within the last second, 

while ***Chamion_Gold_Diff*** is a number of golds earned by a champion within the last second.

Minions killed by champion meet the following conditions
- Minions are near Champion Range. (Except Ezeal, Zigs, Draven, Jhin and Gankplank)
- ***Chamion_Gold_Diff*** is greater than ***Gold_Of_Minion***

### Appendix4: Distinguish *Early Last Hit* and *Late Last Hit* from *Missing_Minions*
*CS Count Early Last Hit* and *Late Last Hit* are very useful to analyze how well a player manages minion waves.

***Early Last Hit*** means **Having     a chance to hit a minion within a second, but the minion was dead**,

***Late  Last Hit*** means **Having not a chance to hit a minion within a second, and the minion was dead**.

Not having a chance to hit a minion means **Minion's health was decreased only because enemy Minions and enemy Turrets**.

Based on those concepts, we can estimate ***Possible Damages taken from Minions and Turrets*** and estimate *Early Last Hit* and *Late Last Hit*.
- Summing up damages comming from minions which can hit the minion.
- Summing up damages comming from turrets which can hit the minion.
- Getting a damage, what is called ***Pure_Damage*** by summing up above 2 damages.
- Getting ***Minion_Health_Diff*** by subtracting current minion's health from previous minion's.
- If ***Minion_Health_Diff*** is greater than ***Pure_Damage***, it must be *Early Last Hit*.
- If not, there is a high possibility that it could be *Late Last Hit*.

### Appendix5: Getting Minions Killed by Turret
`CS Count Lost By Turret` is useful to analyze how many minions lost because of `Recall`, `Roaming`, and `Bad lanining`.

`CS Count Lost By Turret` is a number of minions being dead within Turret Ranage while a champion was not within the Range.

So it can simply be derivated by counting dead minions near Turret while a champion was away, assuming that we know champion's `Role - Top, Mid, or Bot`.

### Appendix6: Getting CS Gold for *Early Last Hit* and *Late Last Hit*
From Appendix3 and Appendix4, we can get attribute `Minion_Name` of `Missing_Minions`.

There are 4 types of minions, and their golds are as follows.
- Ranged Minion: 14 Gold
- Melee  Minion: 21 Gold
- Super  Minion: Same of Siege Minion
- Siege  Minion: 60 ~ 90 Gold based on time. 60 Gold at 2:15, and increases 3 Gold every 90 seconds until 17:15. So 10 times of upgrades.
Just summing up Golds of the missing minions is enough.

### Appendix7: Getting *CS Gold Lost by Turret*
From Appendix5, we can get attribute ***Minion_Name*** of ***Missing_Minions***.

And based on those ***Minion_Names*** and the equation from Appendix6, we can simply calculate ***CS Gold Lost by Turret***.

### Appendix8: Future Works
- We should determine Champion's ***Role*** or ***Location*** to estimate ***CS Count Lost by Turret***. Because in **Blind** Game, no one is dedicated to special ***Role***.
- We can improve accuracy by checking in ***Champion_Name*** and ***CoolDown_Of_Ability*** for Ezeal, Zigs, Draven, Jhin and Gankplank.
- In Appendix3, we can check Gold earned from ***Kills***, ***Assists***, ***Turret_Destroyed***, ***Turret_Plate_Taken*** to improve accuracy.
const GAME_TEAM = {
    BLUE:           100,
    RED:            200,
    NETURAL:        300,
}

const CHAMPION_ROLE = {
    TOP:            "Top",
    JUNGLE:         "Jungle",
    MID:            "Mid",
    BOT:            "Bot",
    SUPPORT:        "Support",
}

const MINION_GOLD = {
    RANGED:         14,
    MELEE:          21,
    SIEGE:          60,
    SUPER:          60,
    UPGRADE_SEC:    90,   // Siege minion costs 3 gold more every 90 seconds.
    UPGRADE_GOLD:   3,    // Siege minion costs 3 gold more every 90 seconds.
    UPGRADE_START:  135,  // 2:15 mins or 135s
    UPGRADE_END:    1035, // 17:15 mins or 1035s.
    UPGRADE_MAX:    10,   // 10 times of upgrade is possible, that is 15 mins
}

const MINION_NAME = {
    MINION:         "MINION",
    RANGED:         "RANGED",
    MELEE:          "MELEE",
    SIEGE:          "SIEGE",
    SUPER:          "SUPER",

    EARLY_HIT:      "Early Hit",
    LATE_HIT:       "Late Hit",
    TURRET_HIT:     "Turret Hit",
}

const ATTACK_RANGE = {
    RANGED_MINION:  500,
    SIEGE_MINION:   300,
    SUPER_MINION:   110,
    MELEE_MINION:   110,
    TURRET:         750,
    CHAMPION_ATTACK: 600, // Skill Range Considered.
    CHAMPION_SKILL: 900, // Skill Range Considered.
}

const ATTACK_DAMAGE = {
    RANGED_MINION:  24,  // + 4.5
    SIEGE_MINION:   41,  // + 1.5
    SUPER_MINION:   230, // + 5
    MELEE_MINION:   12,  // + 3.41
    TURRET:         152, // + 9
    CHAMPION:       50,  // Minimum damage can champion deal to minion - 50
}

const MOVEMENT_SPEED = {
    MINION:         300,
}

const Midlane = [
    [10110.5595703,     10378.2197265625],
    [10883.7998046,     9694.2001953125],
    [8326.16015625,     7047.33984375],
    [4846.58007812,     3954.3798828125],
    [4103.08007812,     4608.66015625],
    [6720.20019531,     7047.33984375],
    [9010.1796875,      9307.580078125]
];
  
const TopLane = [
    [1575.18005371093,  5471.1201171875],
    [1634.66003417968,  10764.83984375],
    [2348.419921875,    11597.5595703125],
    [3002.69995117187,  12192.3603515625],
    [4162.56005859375,  12668.2001953125],
    [4638.39990234375,  12965.599609375],
    [9277.83984375,     13054.8203125],
    [9277.83984375,     14065.98046875],
    [2764.78002929687,  14065.98046875],
    [534.280029296875,  12192.3603515625],
    [504.540008544921,  5441.3798828125]
];
    
const BotLane = [
    [13263,             9010.1796875],
    [13292.740234375,   3627.239990234375],
    [12519.5,           3002.699951171875],
    [11567.8203125,     2616.080078125],
    [10735.099609375,   1396.739990234375],
    [5709.0400390625,   1218.300048828125],
    [5709.0400390625,   266.6199951171875],
    [11686.7802734375,  207.13999938964844],
    [14363.3798828125,  1634.6600341796875],
    [14541.8203125,     5828],
    [14541.8203125,     8861.48046875]
];
    
const mapRegions = [
    {
        id: "MID",
        region: Midlane,
        title: "Mid",
    },
    {
        id: "TOP",
        region: TopLane,
        title: "Top",
    },
    {
        id: "BOT",
        region: BotLane,
        title: "Bot",
    },
];
/*
* Parse Game Json Data.
*/
const parseMinion = () => {

    this.state = {
        gamePath:         "",
        champStats:       {},
        turretSlices:     [],
        lastMinionSlices: [],
        missingMinions:   []
    };

    /*
    * Parse Commandline and get json file path
    */
    const getPathFromCmd = () => {
        if (process.argv.length > 2) {
            return process.argv[2];
        }

        return "";
    }

    /*
    * Load and Parse Json file.
    * [param] path: Json file path.
    */
    const readGame = async path => {
        const fs = require("fs");
        const rawFile = fs.readFileSync(path).toString();
        return await JSON.parse(rawFile);
    };

    /*
    * Parse CS & Gold Difference of a Champion
    * [param] champ: champion stats that contains new cs count, and new gold count as well as location.
    * [param] slice: slices of minions
    */
    const parseChampSlice = (champSlice) => {
        const summonerName = champSlice.name;
        

        // Initialize
        if (this.state.champStats[summonerName] == undefined) {
            this.state.champStats[summonerName]          = {};
            this.state.champStats[summonerName].team     = 0;
            this.state.champStats[summonerName].role     = "TOP";
            this.state.champStats[summonerName].health   = 0;
            this.state.champStats[summonerName].csDiff   = 0;
            this.state.champStats[summonerName].lastCs   = 0;
            this.state.champStats[summonerName].goldDiff = 0;
            this.state.champStats[summonerName].lastGold = 0;
            this.state.champStats[summonerName].position = { X: 0, Y: 0, Z: 0 };
        }

        // Calculate CS difference and Gold Difference
        const champStats    = this.state.champStats[summonerName];
        champStats.team     = champSlice.team;
        champStats.health   = champSlice.health;
        champStats.csDiff   = champSlice.minions    - champStats.lastCs;
        champStats.goldDiff = champSlice.gold_total - champStats.lastGold;
        champStats.lastCs   = champSlice.minions;
        champStats.lastGold = champSlice.gold_total;
        champStats.position = { X: champSlice.X, Y: champSlice.Z, Z: champSlice.Y };
    }

    /*
    * Find the same minion in the previous slice by searching closest minion.
    * [param] pos1: A Position Object that has X and Y attribute.
    * [param] pos2: A Position Object that has X and Y attribute.
    */
    const distance = (pos1, pos2) => {
        const dist = (
            (pos1.X - pos2.X) * (pos1.X - pos2.X) + 
            (pos1.Y - pos2.Y) * (pos1.Y - pos2.Y)
        );

        return Math.sqrt(dist);
    }
    /*
    * Calculate Minion Gold from minion name and game time.
    * [param] minionName: Minion Name
    * [param] gameTime  : Game Time elapsed in second
    * [retrn] minionType (String) and minionGold (Number).
    */
    const calcMinionGold = (minionName, gameTime) => {
        
        // Initialize
        let minionType = MINION_NAME.RANGED;
        let minionGold = MINION_GOLD.RANGED;

        // Get Minion Gold and Minion Name
        if (minionName.indexOf(MINION_NAME.RANGED) !== -1) {
            minionType = MINION_NAME.RANGED;
            minionGold = MINION_GOLD.RANGED;

        } else 
        if (minionName.indexOf(MINION_NAME.MELEE) !== -1) {
            minionType = MINION_NAME.MELEE;
            minionGold = MINION_GOLD.MELEE;

        } else 
        if (minionName.indexOf(MINION_NAME.SIEGE) !== -1) {
            let update = Math.floor((gameTime - MINION_GOLD.UPGRADE_START) / 90);
            update = Math.min(update, MINION_GOLD.UPGRADE_MAX);

            minionType = MINION_NAME.SIEGE;
            minionGold = MINION_GOLD.SIEGE;
            minionGold = minionGold + MINION_GOLD.UPGRADE_GOLD * update;

        } else 
        if (minionName.indexOf(MINION_NAME.SUPER) !== -1) {
            const update = Math.floor((gameTime - MINION_GOLD.UPGRADE_START) / 90);
            update = Math.min(update, MINION_GOLD.UPGRADE_MAX)

            minionType = MINION_NAME.SUPER;
            minionGold = MINION_GOLD.SUPER;
            minionGold = minionGold + MINION_GOLD.UPGRADE_GOLD * update;
        }

        return {minionType, minionGold};
    }

    /*
    * Find the closest minion in the previous slice.
    * [param] minion: A Minion in current time slice.
    */
    const findLastMinion = (minion) => {
        if (minion == undefined || this.state.lastMinionSlices == undefined) {
            return undefined;
        }

        let lastMinion = undefined;
        let closest = MOVEMENT_SPEED.MINION;
        for (const minionSlice of this.state.lastMinionSlices) {
            
            // Last minion should have greater health than current.
            if (
                minionSlice.name       !== minion.name   ||
                minionSlice.type       !== minion.type   ||
                minionSlice.team       !== minion.team   ||
                minionSlice.health     <   minion.health ||
                minionSlice.max_health !== minion.max_health
            ) {
                continue;
            }
            
            const pos1 = {X: minion.X,      Y: minion.Z};
            const pos2 = {X: minionSlice.X, Y: minionSlice.Z};
            const dist = distance(pos1, pos2);

            // Find the closest Minion
            if (closest    > dist) {
                closest    = dist;
                lastMinion = minionSlice;
            }
        }

        return lastMinion;
    }

    /*
    * Parse and Calculate CS Count for early  hit and last hit.
    * Minion get damaged taken by a Champion =>
    * - Champion should be near minion
    * - Damage is greater than the attack damage of minions.
    * To be early hit or late hit,
    * - Minion should be dead within champion's range.
    * - Minion Gold should not be exceed champion's goldDiff
    * [param] deadMinions   : deadMinions in current minion slice
    * [param] minionSlices  : All minions in current minion slice
    * [param] turretSlices  : slices of minions
    * [param] champStats    : champion stats that contains new cs count, and new gold count as well as location.
    * [param] gameTime      : slices of minions
    */
    const getMissingMinions = ({deadMinions, minionSlices, turretSlices, champStats, gameTime}) => {

        if (champStats == undefined) {
            console.error("Error: Champion Stats is undefined");
            return [];
        }
        
        // Filter Out Dead Minions in Champion Range.
        const nearMinions = deadMinions.filter(minion => {
            
            const minionPosition = {X: minion.X, Y: minion.Z};
            const dist = distance(minionPosition, champStats.position);

            if (dist > ATTACK_RANGE.CHAMPION_SKILL) {
                return false;
            }

            return true;
        });

        // Initialize
        let minionsWrongHit = [
            {
                type:      MINION_NAME.RANGED,      // Type of Minion
                gold:      MINION_GOLD.RANGED,      // Gold of this minion
                reason:    MINION_NAME.EARLY_HIT,   // Reason of missing
                confident: 0,                       // Confident of this value.
            }
        ];

        minionsWrongHit = [];

        // Estimate Early Hit Minions
        const missedCount = nearMinions.length - champStats.csDiff;
        for (const minion of nearMinions) {

            // Check if filled out.
            if (missedCount <= minionsWrongHit.length) {
                break;
            }
            
            // Get Last Minion in last Minion Slice
            const lastMinion  = findLastMinion(minion);
            if (lastMinion == undefined) {
                console.log("Not Found Minion:", minion.name);
                continue;
            }

            // Check if minion get damaged by Champion.
            let   pureDamage      = 0;
            const minionHealtDiff = lastMinion.health - minion.health;

            // Estimate Damage taken from ally Minion
            // TODO: We have to consider minion update - Attack Damage Update and Armor Update.
            for (const allyMinion of minionSlices) {

                // Filter out enemy Minions
                if (allyMinion.team === minion.team) {
                    continue;
                }

                // Calculate distance between ally minions and enemy minion.
                const dist = distance({X: allyMinion.X, Y: allyMinion.Z}, {X: minion.X, Y: minion.Z});

                // Estimate Damage from ally Minions
                const allyMinionName = allyMinion.name.toUpperCase();
                if (allyMinionName.indexOf(MINION_NAME.RANGED) !== -1 && dist <= ATTACK_RANGE.RANGED_MINION) {
                    pureDamage += ATTACK_DAMAGE.RANGED_MINION;

                } else 
                if (allyMinionName.indexOf(MINION_NAME.MELEE)  !== -1 && dist <= ATTACK_RANGE.MELEE_MINION) {
                    pureDamage += ATTACK_DAMAGE.MELEE_MINION;

                } else 
                if (allyMinionName.indexOf(MINION_NAME.SIEGE)  !== -1 && dist <= ATTACK_RANGE.SIEGE_MINION) {
                    pureDamage += ATTACK_DAMAGE.SIEGE_MINION;

                } else 
                if (allyMinionName.indexOf(MINION_NAME.SUPER)  !== -1 && dist <= ATTACK_RANGE.SUPER_MINION) {
                    pureDamage += ATTACK_DAMAGE.SUPER_MINION;
                }
            }

            // Estimate Damage taken from ally Turret
            // TODO: We have to consider minion & turret update - Attack Damage Update and Armor Update.
            for (const allyTurret of turretSlices) {

                // Filter out enemy Minions
                if (allyTurret.team === minion.team) {
                    continue;
                }

                // Calculate distance between ally minions and enemy minion.
                const dist = distance({X: allyTurret.X, Y: allyTurret.Z}, {X: minion.X, Y: minion.Z});
                if (dist <= ATTACK_RANGE.TURRET) {
                    pureDamage += ATTACK_DAMAGE.TURRET;
                }
            }

            // Calculate Gold from Minion
            let confident = 1;
            let {minionType, minionGold} = calcMinionGold(minion.name.toUpperCase(), gameTime);

            // Filter out adding a wrong minion as a early or late hit.
            // For example, Siege minion was killed by a champion.
            // In this case, goldDiff will be greater than 60, but if not, it is a wrong hit.
            if ((minionType === MINION_NAME.SIEGE || minionType === MINION_NAME.SUPER) &&
                 minionGold < champStats.goldDiff
            ) {
                continue;
            }

            // if Damage is not enough, champion dealt damage onto it.
            if (minionHealtDiff >= pureDamage + ATTACK_DAMAGE.CHAMPION) {
                minionsWrongHit.push({
                    confident: confident,
                    type:      minionType,
                    gold:      minionGold,
                    reason:    MINION_NAME.EARLY_HIT,
                });    
            } else {
                minionsWrongHit.push({
                    confident: confident,
                    type:      minionType,
                    gold:      minionGold,
                    reason:    MINION_NAME.LATE_HIT,    // Reason of missing
                });    
            }
        }

        // Fill Out Lacking Minions
        const calculatedCount = minionsWrongHit.length;
        for (let i = 0; i < missedCount - calculatedCount; i++) {
            minionsWrongHit.push({
                type:      MINION_NAME.RANGED,      // Type of Minion
                gold:      MINION_GOLD.RANGED,      // Gold of this minion
                reason:    MINION_NAME.EARLY_HIT,   // Reason of missing
                confident: 0,                       // Confident of this value.
            });
        }

        // TODO: Arrange Minions by confident.
        // Reduce the size of array so as to make it not exceed `missedCount`.
        minionsWrongHit = minionsWrongHit.slice(0, missedCount);

        return minionsWrongHit;
    }

    /*
    * Parse and Calculate CS Count for early last hit, late last hit, and lost by Turret.
    * [param] deadMinions   : deadMinions in current minion slice
    * [param] turretSlices  : slices of minions
    * [param] champStats    : champion stats that contains new cs count, and new gold count as well as location.
    * [param] gameTime      : slices of minions
    */
    const getMinionsLostByTurret = ({deadMinions, turretSlices, champStats, gameTime}) => {
        // Initialize
        let minionsLostByTurret = [
            {
                type:      MINION_NAME.RANGED,     // Type of Minion
                gold:      MINION_GOLD.RANGED,     // Gold of this minion
                reason:    MINION_NAME.TURRET_HIT, // Reason of missing
                confident: 0,                      // Confident of this value.
            }
        ];
        minionsLostByTurret = [];

        // TODO:Filter out turrets of other lane's.
        const role = champStats.role;
        const laneTurrets = turretSlices.filter(turret => {
            return true;
        });

        // Filter Out Dead Minions outside Champion Range and within Turret Range.
        const lostMinions = deadMinions.filter(minion => {
    
            const minionPosition = {X: minion.X, Y: minion.Z};
            let   dist = distance(minionPosition, champStats.position);

            // Filter out minions within Champion Range.
            if (dist <= ATTACK_RANGE.CHAMPION_SKILL) {
                return false;
            }

            // Finding minions within Turret Range only.
            for (const turret of laneTurrets) {
                
                const turretPosition = {X: turret.X, Y: turret.Z};
                dist = distance(minionPosition, turretPosition);
                
                if (dist <= ATTACK_RANGE.TURRET) {
                    return true;
                }
            }

            return false;
        });
        
        // Calculate CS Gold Lost by Turret
        for (const minion of lostMinions) {
            let confident = 1;
            let {minionType, minionGold} = calcMinionGold(minion.name.toUpperCase(), gameTime);

            minionsLostByTurret.push({
                confident: confident,
                type:      minionType,
                gold:      minionGold,
                reason:    MINION_NAME.TURRET_HIT,
            });
        }

        return minionsLostByTurret;
    }


    /*
    * Parse and Calculate CS Count for early last hit, late last hit, and lost by Turret.
    * [param] champ: champion stats that contains new cs count, and new gold count as well as location.
    * [param] slice: slices of minions
    */
    const parseMinionSlice = ({minionSlices, summonerName, turretSlices, gameTime}) => {

        const state = this.state;
        const champStats = state.champStats[summonerName];

        // Initialize
        if (state.missingMinions[summonerName] == undefined) {
            state.missingMinions[summonerName] = [];
        }

        // Get enemy minions dead.
        let deadMinions = [];
        for (const minion of Object.values(minionSlices)) {

            // Find Dead minions among enemy minions.
            if (
                minion.health !== 0                 || 
                minion.team   === champStats.team   ||
                minion.team   === GAME_TEAM.NETURAL ||
                minion.name.toUpperCase().indexOf(MINION_NAME.MINION) === -1
            ) {
                continue;
            }
            
            // Dead minions can be last for several seconds.
            const lastMinion = findLastMinion(minion);
            if (lastMinion == undefined || lastMinion.health === 0) {
                continue;
            }

            // TODO: Filter out minions in my lane.
            deadMinions.push(minion);
        }

        // Calculate CS Count of Missing Cases
        const minionsWrongHit     = getMissingMinions({deadMinions, minionSlices, turretSlices, champStats, gameTime});
        const minionsLostByTurret = getMinionsLostByTurret({deadMinions, minionSlices, turretSlices, champStats, gameTime});

        state.missingMinions[summonerName] = state.missingMinions[summonerName].concat(minionsWrongHit);
        state.missingMinions[summonerName] = state.missingMinions[summonerName].concat(minionsLostByTurret);
    }

    /*
    * Parse Command Line and Run Pipeline of parsing CS Count.
    */
    const main = async () => {
        const gamePath = __dirname + "/" + getPathFromCmd();
        const gameData = await readGame(gamePath);
        const timeline = gameData.timeline;

        // Loop for all time slices
        for (const slice of Object.values(timeline)) {
            const gameTime       = slice.gameTime;
            const minionSlices   = slice.minions;
            const turretSlices   = slice.turrets;
            const championSlices = slice.champions;

            // Loop all champions inside time slice
            for (const champSlice of championSlices) {
                parseChampSlice(champSlice);
            }

            // Loop all minions inside time slice
            const summonerName = championSlices[0].name;
            parseMinionSlice({minionSlices, summonerName, turretSlices, gameTime});

            // Backup Minion List
            this.state.lastMinionSlices = minionSlices;
        }

        // Output
        for (const key of Object.keys(this.state.missingMinions)) {
            const missingMinions      = this.state.missingMinions[key];
            const minionsEarlyHit     = missingMinions.filter(minion => minion.reason === MINION_NAME.EARLY_HIT);
            const minionsLateHit      = missingMinions.filter(minion => minion.reason === MINION_NAME.LATE_HIT);
            const minionsTurretHit    = missingMinions.filter(minion => minion.reason === MINION_NAME.TURRET_HIT);
            const csGoldEarlyHit      = minionsEarlyHit .reduce((sum, minion) => (sum + minion.gold), 0);
            const csGoldLateyHit      = minionsLateHit  .reduce((sum, minion) => (sum + minion.gold), 0);
            const csGoldTurretHit     = minionsTurretHit.reduce((sum, minion) => (sum + minion.gold), 0);

            console.log("---------", key, "---------");
            console.log(missingMinions);
            console.log("--------- CS Count For Early Last Hit ---------");
            console.log("CS Count For Early Last Hit:", minionsEarlyHit.length);
            console.log("CS Gold  For Early Last Hit:", csGoldEarlyHit);
    
            console.log("--------- CS Count For Late Last Hit ---------");
            console.log("CS Count For Late  Last Hit:", minionsLateHit.length);
            console.log("CS Gold  For Late  Last Hit:", csGoldLateyHit);
    
            console.log("--------- CS Count Lost By Turret ---------");
            console.log("CS Count Lost by Turret:", minionsTurretHit.length);
            console.log("CS Gold  Lost by Turret:", csGoldTurretHit);    
        }
    }

    main();
}

parseMinion();
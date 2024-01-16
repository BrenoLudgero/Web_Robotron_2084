export {ScoreManager};

class ScoreManager {
    constructor() {
        this.score = 0;
        this.rescueBonus = 0;
        this.nextExtraLife = 25000;
    }
    update(player, soundMngr) {
        this.awardExtraLife(player, soundMngr);
    }
    resetRescueBonus() {
        this.rescueBonus = 0;
    }
    belowBonusLimit() {
        return this.rescueBonus < 4000;
    }
    // Awards human points + bonus up to 5,000 total
    // 1,000 bonus after 2 or more consecutive rescues
    awardRecuePoints(human) {
        this.score += (human.points + this.rescueBonus);
        if (this.belowBonusLimit()) {
            this.rescueBonus += 1000;
        }
    }
    awardEnemyPoints(enemy) {
        this.score += enemy.points;
    }
    extraLifeScoreAchieved() {
        return this.score >= this.nextExtraLife;
    }
    // Awards an extra life when the score is divisible by 25,000
    awardExtraLife(player, soundMngr) {
        if (this.extraLifeScoreAchieved()) {
            player.lives += 1;
            this.nextExtraLife += 25000;
            soundMngr.playSound("extraLife", 5, 0.604);
        }
    }
}

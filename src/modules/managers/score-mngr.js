export {ScoreManager};

class ScoreManager {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.rescueBonus = 0;
        this.nextExtraLife = 25000;
    }
    update() {
        this.awardExtraLife(this.game.player);
    }
    // Methods below used in collisionMngr
    resetRescueBonus() {
        this.rescueBonus = 0;
    }
    // Awards human points + bonus up to 5000 total
    awardRecuePoints(human) {
        this.score += (human.points + this.rescueBonus);
        if (this.rescueBonus < 4000) {
            this.rescueBonus += 1000;
        }
    }
    awardEnemyPoints(enemy) {
        this.score += enemy.points;
    }
    awardExtraLife(player) {
        if (this.score >= this.nextExtraLife) {
            player.lives += 1;
            this.nextExtraLife += 25000;
        }
    }
}
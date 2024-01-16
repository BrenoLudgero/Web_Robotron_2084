export {CollisionManager};
import {typeOfActor} from "../helpers/globals.js";

class CollisionManager {
    update(game) {
        const {actorMngr, scoreMngr, soundMngr, projectileMngr, debuggerr} = game;
        if (!debuggerr.actorInvincibility) {
            this.checkAllCollisions(actorMngr.player, actorMngr.enemies, actorMngr.humans, scoreMngr, soundMngr, projectileMngr);
        }
    }
    checkAllCollisions(player, enemies, humans, scoreMngr, soundMngr, projectileMngr) {
        this.checkPlayerCollisions(player, enemies, scoreMngr, soundMngr, projectileMngr);
        this.checkHumanCollisions(player, enemies, humans, scoreMngr, soundMngr);
        this.checkProjectileCollisions(projectileMngr.projectiles, enemies, scoreMngr, soundMngr);
    }
    isProjectile(actor) {
        return actor.angle !== undefined;
    }
    getLimbHitbox(actor, limb) {
        const hitbox = actor.hitboxes[limb];
        return {
            left: actor.screenX + hitbox.xPosition,
            right: actor.screenX + (hitbox.xPosition + hitbox.width),
            top: actor.screenY + hitbox.yPosition,
            bottom: actor.screenY + (hitbox.yPosition + hitbox.height)
        };
    }
    getRotatedHitbox(projectile) {
        const halfWidth = projectile.width / 2;
        const halfHeight = projectile.height / 2;
        const centerX = projectile.screenX + halfWidth;
        const centerY = projectile.screenY + halfHeight;
        const rotatedX1 = (centerX - (halfWidth * Math.abs(Math.cos(projectile.angle)))) - (halfHeight * Math.abs(Math.sin(projectile.angle)));
        const rotatedX2 = (centerX + (halfWidth * Math.abs(Math.cos(projectile.angle)))) + (halfHeight * Math.abs(Math.sin(projectile.angle)));
        const rotatedY1 = (centerY - (halfWidth * Math.abs(Math.sin(projectile.angle)))) - (halfHeight * Math.abs(Math.cos(projectile.angle)));
        const rotatedY2 = (centerY + (halfWidth * Math.abs(Math.sin(projectile.angle)))) + (halfHeight * Math.abs(Math.cos(projectile.angle)));
        return {
            left: Math.min(rotatedX1, rotatedX2),
            right: Math.max(rotatedX1, rotatedX2),
            top: Math.min(rotatedY1, rotatedY2),
            bottom: Math.max(rotatedY1, rotatedY2)
        };
    }
    collisionDetected(actor, target) {
        return (
            actor.right >= target.left 
            && actor.left <= target.right 
            && actor.bottom >= target.top 
            && actor.top <= target.bottom
        );
    }
    // Checks collision between two actors
    checkSingleCollision(actor, target) {
        for (const targetLimb in target.hitboxes) {
            const targetHitbox = this.getLimbHitbox(target, targetLimb);
            if (this.isProjectile(actor)) {
                const projectileHitbox = this.getRotatedHitbox(actor);
                if (this.collisionDetected(projectileHitbox, targetHitbox)) {
                    return true;
                }
            } else {
                for (const actorLimb in actor.hitboxes) {
                    const actorHitbox = this.getLimbHitbox(actor, actorLimb);
                    if (this.collisionDetected(actorHitbox, targetHitbox)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    // IF ... RETURN TRUE BREAK
    checkPlayerCollisions(player, enemies, scoreMngr, soundMngr, projectileMngr) {
        for (const enemy of enemies) {
            if (this.checkSingleCollision(player, enemy)) {
                player.alive = false;
                player.lives--;
                scoreMngr.resetRescueBonus();
                soundMngr.playSound("playerDestroyed", 6);
                projectileMngr.eraseAllProjectiles();
                break;
            }
        }
    }
    // IF ... RETURN TRUE BREAK
    checkHumanPlayerCollision(humans, player, scoreMngr, soundMngr) {
        for (const human of humans) {
            if (this.checkSingleCollision(player, human)) {
                human.rescued = true;
                scoreMngr.awardRecuePoints(human);
                soundMngr.playSound("humanRescued", 4, 0.47);
                break;
            }
        }
    }
    isHulk(enemy) {
        return enemy.constructor.name === "Hulk";
    }
    // IF ... RETURN TRUE BREAK
    checkHumanEnemyCollision(humans, enemies, soundMngr) {
        for (const enemy of enemies) {
            if (typeOfActor(enemy, "Hulk")) {
                for (const human of humans) {
                    if (this.checkSingleCollision(human, enemy)) {
                        human.alive = false;
                        soundMngr.playSound("humanDestroyed", 4, 0.48);
                        break;
                    }
                }
            }
        }
    }
    checkHumanCollisions(player, enemies, humans, scoreMngr, soundMngr) {
        this.checkHumanPlayerCollision(humans, player, scoreMngr, soundMngr);
        this.checkHumanEnemyCollision(humans, enemies, soundMngr);
    }
    // Checks collision between all projectiles and enemies
    checkProjectileCollisions(projectiles, enemies, scoreMngr, soundMngr) {
        for (const projectile of projectiles) {
            for (const enemy of enemies) {
                // IF ... RETURN TRUE BREAK
                if (this.checkSingleCollision(projectile, enemy)) {
                    if (!typeOfActor(enemy, "Hulk")) {
                        enemy.alive = false;
                        scoreMngr.awardEnemyPoints(enemy);
                        soundMngr.playSound("enemyDestroyed", 3, 0.086);
                    } else {
                        this.knockbackHulk(projectile, enemy);
                    }
                    projectile.mustDelete = true;
                    break;
                }
            }
        }
    }
}

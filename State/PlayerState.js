class PlayerState {
    constructor() {
        this.pizzas = {
            "p1": {
                pizzaId: "s001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null
            },
            // "p2": {
            //     pizzaId: "v001",
            //     hp: 50,
            //     maxHp: 50,
            //     xp: 75,
            //     maxXp: 100,
            //     level: 1,
            //     status: null
            // },
            // "p3": {
            //     pizzaId: "f001",
            //     hp: 50,
            //     maxHp: 50,
            //     xp: 75,
            //     maxXp: 100,
            //     level: 1,
            //     status: null
            // },
        }
        this.lineUp = ["p1"]
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ]
        this.storyFlags = {
            
        }
    }

    addPizza(pizzaId) {
        const newId = `p${Date.now()}`+Math.floor(Math.random() * 99999)
        this.pizzas[newId] = {
            pizzaId,
            hp: 50,
            maxHp: 50,
            xp: 0,
            maxXp: 100,
            level: 1,
            status: null
        }
        if (this.lineUp.length < 3) {
            this.lineUp.push(newId)
        }
        utils.emitEvent("LineUpChange")
        console.log(this)
    }

    swapLineUp(oldId, newId) {
        const oldIndex = this.lineUp.indexOf(oldId)
        this.lineUp[oldIndex] = newId
        utils.emitEvent("LineUpChange")
    }

    moveToFront(futureFrontId) {
        this.lineUp = this.lineUp.filter(id => id !== futureFrontId)
        this.lineUp.unshift(futureFrontId)
        utils.emitEvent("LineUpChange")
    }
}
window.playerState = new PlayerState()
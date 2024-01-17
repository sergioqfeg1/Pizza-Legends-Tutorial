window.Actions = {
    //Movements
    damage1: {
        name: "Whomp!",
        description: "An attack that makes 10 points of damage",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "animation", animation: "spin"},
            {type: "stateChange", damage: 10}
        ]
    },
    saucyStatus: {
        name: "Tomato Squeeze!",
        description: "Starts healing for 3 consecutive turns",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "stateChange", status: {type: "saucy", expiresIn: 3}}
        ]
    },
    clumsyStatus: {
        name: "Olive Oil",
        description: "Enemy can fail to use a movement",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "animation", animation: "glob", color:"#dafd2a"},
            {type: "stateChange", status: {type: "clumsy", expiresIn: 3}},
            {type: "textMessage", text: "{TARGET} is slipping all around!"},
        ]
    },
    //Items
    item_recoverStatus: {
        name: "Healing Lamp",
        description: "Feeling fresh and warm",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} used a {ACTION}!"},
            {type: "stateChange", status: null},
            {type: "textMessage", text: "Feeling fresh!"},
        ]
    },
    item_recoverHp: {
        name: "Parmesan",
        description: "Recover hp",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} used a {ACTION}!"},
            {type: "stateChange", recover: 10,},
            {type: "textMessage", text: "{CASTER} recovers HP!"},
        ]
    },
}
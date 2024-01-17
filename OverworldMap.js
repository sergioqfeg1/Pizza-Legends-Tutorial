class OverworldMap {
    constructor(config){
        this.overworld = null
        this.gameObjects ={}
        this.configObjects = config.configObjects


        this.walls = config.walls || {}

        this.lowerImage = new Image()
        this.lowerImage.src = config.lowerSrc

        this.upperImage = new Image()
        this.upperImage.src = config.upperSrc

        this.isCutscenePlaying = false
        this.isPaused = false

        this.cutsceneSpaces = config.cutsceneSpaces || {}
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
             utils.withGrid(10.5)-cameraPerson.x,
              utils.withGrid(6)-cameraPerson.y)
    }

    drawUpperImage(ctx, cameraPerson){
        ctx.drawImage(
            this.upperImage,
             utils.withGrid(10.5)-cameraPerson.x,
              utils.withGrid(6)-cameraPerson.y)
    }

    isSpaceTaken(currenntX, currentY, direction){
        const {x,y} = utils.nextPosition(currenntX, currentY, direction)
        if(this.walls[`${x},${y}`]) {
            return true
        }

        //Check for game objects at this position
        return Object.values(this.gameObjects).find(obj => {
            if (obj.x === x && obj.y === y) {return true}
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y ){
                return true
            }
            return false
        })
    }

    mountObjects(){
        Object.keys(this.configObjects).forEach(key => {

            let object = this.configObjects[key]
            object.id = key

            //TODO: determine if this object should mount
            let instance
            if (object.type === "Person"){
                instance = new Person(object)
            }
            if (object.type === "PizzaStone"){
                instance = new PizzaStone(object)
            }
            this.gameObjects[key] = instance
            this.gameObjects[key].id = key
            instance.mount(this)

            // object.mount(this)
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true

        //Start loop of async event
        //await each one
        for (let i=0; i < events.length; i++){
            const eventHandler = new OverworldEvent({
                map: this,
                event: events[i]
            })
            const result = await eventHandler.init()
            if (result === "LOST_BATTLE"){
                break
            }
        }

        this.isCutscenePlaying = false

        //Reset NPCs to idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviourEvent(this))

    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"]
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction)
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        })
        if (!this.isCutscenePlaying && match && match.talking.length) {

            const relevantScenario = match.talking.find(s => {
                return (s.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"]
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`]
        if (!this.isCutscenePlaying && match){
            this.startCutscene(match[0].events)
        }
    }

    // addWall(x,y){
    //     this.walls[`${x},${y}`] = true
    // }

    // removeWall(x,y){
    //     delete this.walls[`${x},${y}`]
    // }

    // moveWall(wasX, wasY, direction){
    //     this.removeWall(wasX,wasY)
    //     const {x,y} = utils.nextPosition(wasX, wasY, direction)
    //     this.addWall(x,y)
    // }



}

window.OverworldMaps = {
    DemoRoom: {
        id: "DemoRoom",
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
        gameObjects: {

        },
       configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x:utils.withGrid(5),
                y:utils.withGrid(6),
            },
            npcA: {
                type: "Person",
                x:utils.withGrid(7),
                y:utils.withGrid(9),
                src:"/images/characters/people/npc1.png",
                behaviorLoop: [
                    {type:"stand", direction:"left", time:800},
                    {type:"stand", direction:"up", time:800},
                    {type:"stand", direction:"right", time:1200},
                    {type:"stand", direction:"up", time:300},
                ],
                talking: [
                    {
                        required: ["TALKED_TO_ERIO"],
                        events: [
                            {type:"textMessage", text:"Isn't Erio the coolest?", faceHero: "npcA"},
                        ]
                    },
                    {
                        events: [
                            {type:"textMessage", text:"I'm going to crush you!", faceHero: "npcA"},
                            { type: "battle", enemyId: "beth" },
                            { type:"addStoryFlag", flag: "DEFEATED_BETH" },
                            {type:"textMessage", text:"Well...Hahahahah", faceHero: "npcA"},
                            // {type:"textMessage", text:"OK, you already pushed my buttons, now GO AWAY!", faceHero: "npcA"},
                            // {who: "hero", type:"walk", direction:"up"},
                        ]
                    },
                    
                ]
            },
            npcB: {
                type: "Person",
                x:utils.withGrid(8),
                y:utils.withGrid(5),
                src:"/images/characters/people/erio.png",
                talking: [
                    {
                        events: [
                            {type:"textMessage", text: "Bahahahaha!", faceHero: "npcB"},
                            { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
                            {type: "battle", enemyId: "erio"},
                        ]
                    }
                ]
                // behaviorLoop: [
                //     {type:"walk", direction:"left"},
                //     {type:"stand", direction:"up", time: 800},
                //     {type:"walk", direction:"up"},
                //     {type:"walk", direction:"right"},
                //     {type:"walk", direction:"down"},
                    
                // ]
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                storyFlag: "USED_PIZZA_STONE",
                pizzas: ["v001", "f001"]
            }
        },
        walls: {
            [utils.asGridCoord(7,6)]: true, // == "16,16": true
            [utils.asGridCoord(8,6)]: true,
            [utils.asGridCoord(7,7)]: true,
            [utils.asGridCoord(8,7)]: true,

            // Hardcodeo provisional para no salirme
            [utils.asGridCoord(0,4)]: true,
            [utils.asGridCoord(0,5)]: true,
            [utils.asGridCoord(0,6)]: true,
            [utils.asGridCoord(0,7)]: true,
            [utils.asGridCoord(0,8)]: true,
            [utils.asGridCoord(0,9)]: true,

            [utils.asGridCoord(1,10)]: true,
            [utils.asGridCoord(2,10)]: true,
            [utils.asGridCoord(3,10)]: true,
            [utils.asGridCoord(4,10)]: true,
            [utils.asGridCoord(6,10)]: true,
            [utils.asGridCoord(7,10)]: true,
            [utils.asGridCoord(8,10)]: true,
            [utils.asGridCoord(9,10)]: true,
            [utils.asGridCoord(10,10)]: true,

            [utils.asGridCoord(11,4)]: true,
            [utils.asGridCoord(11,5)]: true,
            [utils.asGridCoord(11,6)]: true,
            [utils.asGridCoord(11,7)]: true,
            [utils.asGridCoord(11,8)]: true,
            [utils.asGridCoord(11,9)]: true,

            [utils.asGridCoord(10,3)]: true,
            [utils.asGridCoord(9,3)]: true,
            [utils.asGridCoord(8,4)]: true,
            [utils.asGridCoord(6,4)]: true,
            [utils.asGridCoord(5,3)]: true,
            [utils.asGridCoord(4,3)]: true,
            [utils.asGridCoord(3,3)]: true,
            [utils.asGridCoord(2,3)]: true,
            [utils.asGridCoord(1,3)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7,4)]: [
                {
                    events: [
                        {who: "npcB", type:"walk", direction:"left"},
                        {who: "npcB", type:"stand", direction:"up", time: 500},
                        {type:"textMessage", text:"You can't be in there"},
                        {who: "npcB", type:"walk", direction:"right"},
                        {who: "hero", type:"walk", direction:"down"},
                        {who: "hero", type:"walk", direction:"left"},
                    ],
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        {
                            type:"changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(10),
                            y: utils.withGrid(5),
                            direction: "down"
                        }
                    ],
                }
            ],
        }
    },
    Kitchen: {
        id: "Kitchen",
        lowerSrc: "/images/maps/KitchenLower.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x:utils.withGrid(10),
                y:utils.withGrid(5),
            },
            kitchenNpcA: {
                type: "Person",
                x: utils.withGrid(9),
                y: utils.withGrid(5),
                direction: "up",
                src: "/images/characters/people/npc8.png",
                talking: [
                  {
                    events: [
                      { type: "textMessage", text: "** They don't want to talk to you **",},
                    ]
                  }
                ]
              },
            kitchenNpcB: {
                type: "Person",
                x: utils.withGrid(3),
                y: utils.withGrid(6),
                src: "/images/characters/people/npc3.png",
                talking: [
                    {
                    events: [
                        { type: "textMessage", text: "People take their jobs here very seriously.", faceHero: "kitchenNpcB" },
                    ]
                    }
                ]
            },
        },
        walls: {
            [utils.asGridCoord(2,4)]: true,
            [utils.asGridCoord(3,4)]: true,
            [utils.asGridCoord(5,4)]: true,
            [utils.asGridCoord(6,4)]: true,
            [utils.asGridCoord(7,4)]: true,
            [utils.asGridCoord(8,4)]: true,
            [utils.asGridCoord(11,4)]: true,
            [utils.asGridCoord(11,5)]: true,
            [utils.asGridCoord(12,5)]: true,
            [utils.asGridCoord(1,5)]: true,
            [utils.asGridCoord(1,6)]: true,
            [utils.asGridCoord(1,7)]: true,
            [utils.asGridCoord(1,9)]: true,
            [utils.asGridCoord(2,9)]: true,
            [utils.asGridCoord(6,7)]: true,
            [utils.asGridCoord(7,7)]: true,
            [utils.asGridCoord(9,7)]: true,
            [utils.asGridCoord(10,7)]: true,
            [utils.asGridCoord(9,9)]: true,
            [utils.asGridCoord(10,9)]: true,
            [utils.asGridCoord(3,10)]: true,
            [utils.asGridCoord(4,10)]: true,
            [utils.asGridCoord(6,10)]: true,
            [utils.asGridCoord(7,10)]: true,
            [utils.asGridCoord(8,10)]: true,
            [utils.asGridCoord(11,10)]: true,
            [utils.asGridCoord(12,10)]: true,

            [utils.asGridCoord(0,8)]: true,
            [utils.asGridCoord(5,11)]: true,

            [utils.asGridCoord(4,3)]: true,
            [utils.asGridCoord(9,4)]: true,
            [utils.asGridCoord(10,4)]: true,

            [utils.asGridCoord(13,6)]: true,
            [utils.asGridCoord(13,7)]: true,
            [utils.asGridCoord(13,8)]: true,
            [utils.asGridCoord(13,9)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,10)]:[
                {
                    events: [
                        {
                            type:"changeMap", 
                            map: "Street",
                            x: utils.withGrid(29),
                            y: utils.withGrid(9), 
                            direction: "down"
                        }
                    ]
                }
            ],
            // [utils.asGridCoord(10,6)]: [{
            //     disqualify: ["SEEN_INTRO"],
            //     events: [
            //       { type: "addStoryFlag", flag: "SEEN_INTRO"},
            //       { type: "textMessage", text: "* You are chopping ingredients on your first day as a Pizza Chef at a famed establishment in town. *"},
            //       { type: "walk", who: "kitchenNpcA", direction: "down"},
            //       { type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
            //       { type: "stand", who: "hero", direction: "left", time: 200},
            //       { type: "textMessage", text: "Ahem. Is this your best work?"},
            //       { type: "textMessage", text: "These pepperonis are completely unstable! The pepper shapes are all wrong!"},
            //       { type: "textMessage", text: "Don't even get me started on the mushrooms."},
            //       { type: "textMessage", text: "You will never make it in pizza!"},
            //       { type: "stand", who: "kitchenNpcA", direction: "right", time: 200},
            //       { type: "walk", who: "kitchenNpcA", direction: "up"},
            //       { type: "stand", who: "kitchenNpcA", direction: "up", time: 300},
            //       { type: "stand", who: "hero", direction: "down", time: 400},
            //       { type: "textMessage", text: "* The competition is fierce! You should spend some time leveling up your Pizza lineup and skills. *"},
            //       {
            //         type: "changeMap",
            //         map: "Street",
            //         x: utils.withGrid(5),
            //         y: utils.withGrid(10),
            //         direction: "down"
            //       },
            //     ]
            //   }]
        }
    }, 
    Street: {
        id: "Street",
        lowerSrc: "/images/maps/StreetLower.png",
        upperSrc: "/images/maps/StreetUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(30),
                y: utils.withGrid(10)
            }
        },
        walls: function() {
            let walls = {};
            ["4,9", "5,8", "6,9", "7,9", "8,9", "9,9", "10,9", "11,9", "12,9", "13,8", "14,8", "15,7",
              "16,7", "17,7", "18,7", "19,7", "20,7", "21,7", "22,7", "23,7", "24,7", "24,6", "24,5", "26,5", "26,6", "26,7", "27,7", "28,8", "28,9", "29,8", "30,9", "31,9", "32,9", "33,9",
              "16,9", "17,9", "25,9", "26,9", "16,10", "17,10", "25,10", "26,10", "16,11", "17,11", "25,11", "26,11",
              "18,11","19,11",
              "4,14", "5,14", "6,14", "7,14", "8,14", "9,14", "10,14", "11,14", "12,14", "13,14", "14,14", "15,14", "16,14", "17,14", "18,14", "19,14", "20,14", "21,14", "22,14", "23,14",
              "24,14", "25,14", "26,14", "27,14", "28,14", "29,14", "30,14", "31,14", "32,14", "33,14",
              "3,10", "3,11", "3,12", "3,13", "34,10", "34,11", "34,12", "34,13",
                "29,8","25,4",
            ].forEach(coord => {
              let [x,y] = coord.split(",");
              walls[utils.asGridCoord(x,y)] = true;
            })
            return walls;
        }(),
        cutsceneSpaces: {
            [utils.asGridCoord(29,9)]: [
                {
                    events: [
                        {
                            type:"changeMap", 
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(10), 
                            direction: "up"
                        },
                    ]
                }
            ],
            [utils.asGridCoord(25,5)]: [
                {
                    events: [
                        {
                            type:"changeMap", 
                            map: "StreetNorth",
                            x: utils.withGrid(7),
                            y: utils.withGrid(16), 
                            direction: "up"
                        },
                    ]
                }
            ]
        }
    },
    StreetNorth: {
        id: "StreetNorth",
        lowerSrc: "/images/maps/StreetNorthLower.png",
        upperSrc: "/images/maps/StreetNorthUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(8),
                y: utils.withGrid(16)
            }
        },
        walls: {
            [utils.asGridCoord(2,7)]: true,
            [utils.asGridCoord(3,7)]: true,
            [utils.asGridCoord(3,6)]: true,
            [utils.asGridCoord(4,5)]: true,
            [utils.asGridCoord(5,5)]: true,
            [utils.asGridCoord(6,5)]: true,
            [utils.asGridCoord(8,5)]: true,
            [utils.asGridCoord(9,5)]: true,
            [utils.asGridCoord(10,5)]: true,
            [utils.asGridCoord(11,6)]: true,
            [utils.asGridCoord(12,6)]: true,
            [utils.asGridCoord(13,6)]: true,
            [utils.asGridCoord(7,8)]: true,
            [utils.asGridCoord(8,8)]: true,
            [utils.asGridCoord(7,9)]: true,
            [utils.asGridCoord(8,9)]: true,
            [utils.asGridCoord(7,10)]: true,
            [utils.asGridCoord(8,10)]: true,
            [utils.asGridCoord(9,10)]: true,
            [utils.asGridCoord(10,10)]: true,
            [utils.asGridCoord(2,15)]: true,
            [utils.asGridCoord(3,15)]: true,
            [utils.asGridCoord(4,15)]: true,
            [utils.asGridCoord(5,15)]: true,
            [utils.asGridCoord(6,15)]: true,
            [utils.asGridCoord(6,16)]: true,
            [utils.asGridCoord(8,16)]: true,
            [utils.asGridCoord(8,15,)]: true,
            [utils.asGridCoord(9,15)]: true,
            [utils.asGridCoord(10,15)]: true,
            [utils.asGridCoord(11,15)]: true,
            [utils.asGridCoord(12,15)]: true,
            [utils.asGridCoord(13,15)]: true,
      
            [utils.asGridCoord(1,8)]: true,
            [utils.asGridCoord(1,9)]: true,
            [utils.asGridCoord(1,10)]: true,
            [utils.asGridCoord(1,11)]: true,
            [utils.asGridCoord(1,12)]: true,
            [utils.asGridCoord(1,13)]: true,
            [utils.asGridCoord(1,14)]: true,
      
            [utils.asGridCoord(14,7)]: true,
            [utils.asGridCoord(14,8)]: true,
            [utils.asGridCoord(14,9)]: true,
            [utils.asGridCoord(14,10)]: true,
            [utils.asGridCoord(14,11)]: true,
            [utils.asGridCoord(14,12)]: true,
            [utils.asGridCoord(14,13)]: true,
            [utils.asGridCoord(14,14)]: true,
      
            [utils.asGridCoord(7,17)]: true,
            [utils.asGridCoord(7,4)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7,16)]: [
                {
                    events: [
                        {
                            type:"changeMap", 
                            map: "Street",
                            x: utils.withGrid(25),
                            y: utils.withGrid(5), 
                            direction: "down"
                        }
                    ]
                }
            ]
        }
    }
}
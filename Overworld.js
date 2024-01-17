class Overworld {

    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null
    }

    gameLoopStepWork(delta) {
        //Clear off canvas
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)

        //Stablish camera
        const cameraPerson = this.map.gameObjects.hero

        // Update all objects
        Object.values(this.map.gameObjects).forEach(object => {
            object.update({
                delta,
                arrow: this.directionInput.direction,
                map: this.map,
            })
        })

        //Draw Lower Map
        this.map.drawLowerImage(this.ctx, cameraPerson)

        //DrawGameObjects
        Object.values(this.map.gameObjects).sort((a,b) => {
            return a.y - b.y
        }).forEach(object => {
            object.sprite.draw(this.ctx, cameraPerson)
        })

        //Draw Upper Map
        this.map.drawUpperImage(this.ctx, cameraPerson)
    }

    startGameLoop() {

        let prevMs
        const step = 1/60

        const stepFn = (timestampMs) => {

            if (this.map.isPaused){
                return
            }
            if (prevMs === undefined){
                prevMs = timestampMs
            }
            let delta = (timestampMs - prevMs) / 1000
            while(delta >= step){
                this.gameLoopStepWork(delta)
                delta -= step
            }
            prevMs = timestampMs - delta * 1000

            //Business as usual tick
            requestAnimationFrame(stepFn)
        }
        //First kickoff tick
        requestAnimationFrame(stepFn)
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Is there a person to talk to
            this.map.checkForActionCutscene()
        })
        new KeyPressListener("Escape", () => {
            if (!this.map.isCutscenePlaying){
                this.map.startCutscene([
                    {type: "pause"}
                ])
            }
        })
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                //Hero position has changed
                this.map.checkForFootstepCutscene()
            }
        })
    }

    startMap(mapConfig, heroInitState=null) {
        this.map = new OverworldMap(mapConfig)
        this.map.overworld = this
        this.map.mountObjects()

        if (heroInitState){
            const {hero} = this.map.gameObjects
            // this.map.removeWall(hero.x, hero.y)
            hero.x = heroInitState.x
            hero.y = heroInitState.y
            hero.direction = heroInitState.direction
            // this.map.addWall(hero.x, hero.y)
        }

        this.progress.mapId = mapConfig.id
        this.progress.startingHeroX = this.map.gameObjects.hero.x
        this.progress.startingHeroY = this.map.gameObjects.hero.y
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction
    }

    async init() {

        const container = document.querySelector(".game-container")

        //Create the progress file
        this.progress = new Progress()

        //Show title screen
        this.titleScreen = new TitleScreen({
            progress: this.progress
        })
        const usesSaveFile = await this.titleScreen.init(container)

        //Potentially load saved data
        let initHeroState = null
        // const saveFile = this.progress.getSaveFile()
        if (usesSaveFile) {
            this.progress.load()
            initHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
        }

        //Load hud
        this.hud = new Hud()
        this.hud.init(document.querySelector(".game-container"))

        //Start first map
        this.startMap(window.OverworldMaps[this.progress.mapId], initHeroState)

        //Create controls
        this.bindActionInput()
        this.bindHeroPositionCheck()

        this.directionInput = new DirectionInput()
        this.directionInput.init()
        this.directionInput.direction

        //Kick off the game
        this.startGameLoop()

        // this.map.startCutscene([
        //     {type:"battle", enemyId: "beth"}
        //     // {type:"changeMap", map:"DemoRoom"}
        //     // {type:"textMessage", text:"This is the very first message"}
        // ])
    }

}
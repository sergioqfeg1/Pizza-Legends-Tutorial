class GameObject {
    constructor(config){
        this.id = null
        this.isMounted = false
        this.x = config.x || 0
        this.y = config.y || 0
        this.direction = config.direction || "down"
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "/images/characters/people/hero.png",
        })
        this.behaviorLoop = config.behaviorLoop || []
        this.behaviorLoopIndex = 0

        this.talking = config.talking || []
        this.retryTimeout = null
    }

    mount(map) {
        console.log("mounting!")
        this.isMounted = true
        // map.addWall(this.x,this.y)

        //If we have a behavior, kick off after short delay
        setTimeout(() => {
            this.doBehaviourEvent(map)
        }, 10)

    }

    async doBehaviourEvent(map) {

        //Don't do anything if there's a more important cutscene or I don't have nothing to do anything anyway
        if (this.behaviorLoop.length === 0){
            return
        }

        if (map.isCutscenePlaying){

            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout)
            }

            this.retryTimeout = setTimeout(() => {
                this.doBehaviourEvent(map)
            }, 1000)
            return
        }

        //Setting up event with relevant info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex]
        eventConfig.who = this.id

        //Create event instance out of our event config
        const eventHandler = new OverworldEvent({map, event: eventConfig})
        await eventHandler.init()

        //Setting the next event to fire
        this.behaviorLoopIndex += 1
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0
        }

        //Do it again
        this.doBehaviourEvent(map)
    }

    update(){

    }
}
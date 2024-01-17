class Person extends GameObject{
    constructor(config){
        super(config)
        this.movementProgressRemaining = 0
        this.isStanding = false
        this.intentPosition = null //[x,y]

        this.isPlayerControlled = config.isPlayerControlled || false

        this.directionUpdate = {
            "up": ["y",-1],
            "down": ["y",1],
            "left": ["x",-1],
            "right": ["x",1],
        }
    }

    update(state){
        if (this.movementProgressRemaining > 0){
            this.updatePosition()
        } else {

            //More cases for starting to walk

            //Case: Keyboard ready and have arrow pressed
            if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow){
                this.startBehavior(state, {
                    type:"walk",
                    direction: state.arrow
                })
            }
            this.updateSprite(state)
        }
        // console.log(this.x/16,this.y/16)
    }

    startBehavior(state, behavior){

        if (!this.isMounted) {
            return
        }

        //Set character direction to behavior
        this.direction = behavior.direction

        if (behavior.type === "walk"){

            //Stop if space not here
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)){

                behavior.retry && setTimeout(()=>{
                    this.startBehavior(state, behavior)
                }, 10)

                return
            }

            //Ready to walk
            // state.map.moveWall(this.x,this.y,this.direction)
            this.movementProgressRemaining = 16

            //Add next position
            const intentPosition = utils.nextPosition(this.x,this.y,this.direction)
            this.intentPosition = [
                intentPosition.x,
                intentPosition.y
            ]

            this.updateSprite(state)
        }

        if (behavior.type === "stand"){
            this.isStanding = true
            setTimeout(() => {
                //We finished the walk!
                this.intentPosition = null
                utils.emitEvent("PersonStandComplete", {
                    whoId: this.id
                })
                this.isStanding = false
            }, behavior.time)
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction]
        this[property] += change
        this.movementProgressRemaining -= 1

        if (this.movementProgressRemaining === 0){
            //We finished walk
            utils.emitEvent("PersonWalkingComplete", {
                whoId: this.id
            })
        }
    }

    updateSprite(state){
        if (this.movementProgressRemaining > 0){
            this.sprite.setAnimation("walk-"+this.direction)
            return
        }

        this.sprite.setAnimation("idle-"+this.direction)

    }

}
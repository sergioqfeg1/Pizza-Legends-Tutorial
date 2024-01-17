class PizzaStone extends GameObject{
    constructor(config) {
        super(config)
        this.sprite = new Sprite({
            gameObject: this,
            src: "./images/characters/pizza-stone.png",
            animations: {
                "used_down": [[0,0]],
                "unused_down": [[1,0]],
            },
            currentAnimation: "used-down"
        })
        this.storyFlag = config.storyFlag
        this.pizzas = config.pizzas
        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    {type: "textMessage", text: "You have already used this"}
                ]
            },
            {
                events: [
                    {type:"textMessage", text: "Approaching the legendary pizza stone..."},
                    {type:"craftingMenu", pizzas: ["v001", "f001"]},
                    {type:"addStoryFlag", flag: this.storyFlag},
                ]
            }
        ]
    }

    update() {
        this.sprite.currentAnimation = 
            playerState.storyFlags[this.storyFlag] ? 
            "used_down" : "unused_down"
    }
}
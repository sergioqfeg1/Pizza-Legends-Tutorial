class PauseMenu {
    constructor({progress, onComplete}) {
        this.progress = progress
        this.onComplete = onComplete
    }

    getOptions(pageKey){

        //Case 1: Show the first page of options
        if (pageKey === "root"){
            const lineUpPizzas = playerState.lineUp.map(id => {
                const {pizzaId} = playerState.pizzas[id]
                const base = Pizzas[pizzaId]
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions( this.getOptions(id) )
                    }
                }
            })
            return [
                ...lineUpPizzas,
                {
                    label: "Save",
                    description: "Save your progress",
                    handler: () => {
                        //We'll come back to this...
                        this.progress.save()
                        this.close()
                    },
                },
                {
                    label: "Close",
                    description: "Close the pause menu",
                    handler: () => {
                        this.close()
                    }
                }
            ]
        }

        //Case 2: Show the options for just one pizza (id)
        const unequiped = Object.keys(playerState.pizzas).filter(id => {
            return playerState.lineUp.indexOf(id) === -1
        }).map(id => {
            const {pizzaId} = playerState.pizzas[id]
            const base = Pizzas[pizzaId]
            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineUp(pageKey, id)
                    this.keyboardMenu.setOptions(this.getOptions("root"))
                }
            }
        })
        return [
            // Swap for any unequiped pizza...
            ...unequiped,
            {
                label: "Move to front",
                description: "Move this pizza to the frony of the list",
                handler: () => {
                    playerState.moveToFront(pageKey)
                    this.keyboardMenu.setOptions(this.getOptions("root"))
                }
            },
            {
                label: "Back",
                description: "Go back",
                handler: () => {
                    this.keyboardMenu.setOptions(this.getOptions("root"))
                }
            }
        ]
        return []
    }

    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add("PauseMenu")
        this.element.classList.add("overlayMenu")
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>

        `)
    }

    close() {
        this.esc?.unbind()
        this.keyboardMenu.end()
        this.element.remove()
        this.onComplete()
    }

    init(container) {
        this.createElement()
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element)
        this.keyboardMenu.setOptions(this.getOptions("root"))

        container.appendChild(this.element)

        utils.wait(200)
        this.esc = new KeyPressListener("Escape", () => {
            this.close()
        })
    }
}
class ReplacementMenu {
    constructor({replacements, onComplete}) {
        this.replacements = replacements
        this.onComplete = onComplete
    }

    decide() {
        this.menuSumit(this.replacements[0])
    }

    menuSumit(replacement) {
        this.keyboardMenu?.end()
        this.onComplete(replacement)
    }

    showMenu(container){
        this.keyboardMenu = new KeyboardMenu()
        this.keyboardMenu.init(container)
        this.keyboardMenu.setOptions(this.replacements.map(c => {
            return {
                label: c.name,
                description: c.description,
                handler: () =>{
                    this.menuSumit(c)
                }
            }
        }))
    }

    init(container) {

        if (this.replacements[0].isPlayerControlled){
            this.showMenu(container)
        } else {
            this.decide()
        }
    }
}
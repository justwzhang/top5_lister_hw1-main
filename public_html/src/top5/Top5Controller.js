/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author Justin Zhang
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    moveItem(oldIndex, newIndex){
        
    }
    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let addButton = document.getElementById("add-list-button");
            this.model.view.enableButton("close-button");
            if(!addButton.classList.contains("disabled")){
                let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
                this.model.loadList(newList.id);
                this.model.saveLists();
            }
            let statusBar = document.getElementById("top5-statusbar");
            let tempElemnt = document.createElement("h1");
            tempElemnt.setAttribute("style", "text-align:center");
            tempElemnt.innerHTML = "Top 5 Untitled";
            statusBar.appendChild(tempElemnt);
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

        //close button
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.unselectAll();
            this.model.view.disableButton("close-button");
            this.model.view.updateToolbarButtons(this.model);
            let statusBar = document.getElementById("top5-statusbar");
            this.model.tps.clearAllTransactions();
            this.model.view.updateToolbarButtons(this.model);
            statusBar.innerHTML = "";
            this.model.view.enableButton("add-list-button");
            for(let i = 1; i<=5; i++){
                let item = document.getElementById("item-" + i);
                item.textContent = "";
            }
        }
        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);
            //saves the id for future use
            item.ondragstart = (event) => {
                this.originalId = event.target.id;
            }
            //splices the items in the array
            item.ondrop = (event) => {
                let newId = event.target.id;
                let newIndex = parseInt(event.target.id.substring(5))-1;
                let originalIndex = parseInt(this.originalId.substring(5))-1;
                this.model.addMoveItemTransaction(originalIndex, newIndex);
                this.model.view.updateToolbarButtons(this.model);
                this.model.saveLists();
            }
            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    this.model.view.disableButton("add-list-button");

                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                        this.model.view.updateToolbarButtons(this.model);
                        this.model.view.enableButton("add-list-button");
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                            this.model.view.updateToolbarButtons(this.model);
                            this.model.view.enableButton("add-list-button");
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                        this.model.view.updateToolbarButtons(this.model);
                        this.model.view.enableButton("add-list-button");
                    }
                    this.model.view.updateToolbarButtons(this.model);
                }
            }
        }
    }

    registerListSelectHandlers(id) {
        // FOR CHANGING LIST NAME
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            this.model.view.disableButton("add-list-button");
            let doc = document.getElementById("list-card-text-" + id);

            doc.innerHTML = "";

            let textInput = document.createElement("input");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "list-text-input-" + id);

            let originalName = this.model.top5Lists[id].getName();
            textInput.setAttribute("value", originalName);
            doc.appendChild(textInput);

            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }

            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    this.model.view.enableButton("add-list-button");
                    let name = event.target.value;
                    this.model.view.disableButton("close-button");
                    if(name === ""){
                        name = "Untitled"
                    }
                    doc.innerHTML = name;
                    this.model.top5Lists[id].setName(name);
                    this.model.sortLists();
                    this.model.updateId();
                    this.model.view.refreshLists(this.model.top5Lists);
                    this.model.saveLists();
                    for(let i = 1; i<=5; i++){
                        let item = document.getElementById("item-" + i);
                        item.textContent = "";
                    }
                    let statusBar = document.getElementById("top5-statusbar");
                    statusBar.innerHTML = "";
                }
            }

            textInput.onblur = (event) => {
                this.model.view.disableButton("close-button");
                this.model.view.enableButton("add-list-button");
                let name = event.target.value;
                if(name === ""){
                    name = "Untitled"
                }
                doc.innerHTML = name;
                this.model.top5Lists[id].setName(name);
                this.model.sortLists();
                this.model.updateId();
                this.model.view.refreshLists(this.model.top5Lists);
                this.model.saveLists();
                for(let i = 1; i<=5; i++){
                    let item = document.getElementById("item-" + i);
                    item.textContent = "";
                }
                let statusBar = document.getElementById("top5-statusbar");
                statusBar.innerHTML = "";
            }
        }
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();
            let statusBar = document.getElementById("top5-statusbar");
            statusBar.innerHTML = "";
            let tempElemnt = document.createElement("h1");
            tempElemnt.setAttribute("style", "text-align:center");
            let currentListName = this.model.top5Lists[id].name;
            tempElemnt.innerHTML = "Top 5 " + currentListName;
            statusBar.appendChild(tempElemnt);
            this.model.view.enableButton("close-button");

            // GET THE SELECTED LIST
            this.model.loadList(id);
        }

        // For Mousing Over list
        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            let hoveredElement = document.getElementById("top5-list-" + id);
            if(hoveredElement.classList.contains("unselected-list-card")){
                hoveredElement.classList.remove("unselected-list-card");
                hoveredElement.classList.add("hovered-list-card");
            }
        }
        document.getElementById("top5-list-" + id).onmouseleave = (event) => {
            let hoveredElement = document.getElementById("top5-list-" + id);
            if(hoveredElement.classList.contains("hovered-list-card")){
                hoveredElement.classList.remove("hovered-list-card");
                hoveredElement.classList.add("unselected-list-card");
            }
        }

        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            this.model.view.disableButton("add-list-button");
            modal.classList.add("is-visible");
            //clicking confirm
            document.getElementById("dialog-confirm-button").onmousedown = (event)=>{
                this.model.view.disableButton("close-button");
                this.model.removeFromList(id);
                modal.classList.remove("is-visible");
                this.model.saveLists();
                for(let i = 1; i<=5; i++){
                    let item = document.getElementById("item-" + i);
                    item.textContent = "";
                }
                let statusBar = document.getElementById("top5-statusbar");
                statusBar.innerHTML = "";
                this.model.view.enableButton("add-list-button");
            }
            //clicking cancel
            document.getElementById("dialog-cancel-button").onmousedown = (event)=>{
                modal.classList.remove("is-visible");
            }
            this.model.view.enableButton("add-list-button");
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}
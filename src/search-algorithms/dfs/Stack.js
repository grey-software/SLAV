module.exports = class Stack{

    constructor() 
    { 
        this.items = []; 
    } 

    push(element) 
    { 
        // push element into the items 
        this.items.push(element); 
    } 
    pop() 
    { 
        if (this.items.length == 0){ 
            return "Error"; 
        }    
        return this.items.pop(); 
    } 

    isEmpty(){
        return this.items.length == 0;



    }


};
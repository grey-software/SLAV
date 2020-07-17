module.exports = class Queue {
  //Linked list implementation is faster
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  front() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length == 0;
  }
  length(){
    return this.items.length;

  }
};

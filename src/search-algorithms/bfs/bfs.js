const Queue = require('./Queue')

module.exports = function bfs (graph, start) {
    const visited = [];

    const queue = new Queue();
    start.dist = 0;
    queue.enqueue(start);
    while (!queue.isEmpty()) {
        const currentNode = queue.dequeue();
        visited.push(currentNode);
        currentNode.color = "grey";
        for (const neighbour of currentNode.adj) {
            //Visit
            // console.log(neighbour)
            // console.log(`Visiting neighbor: (x: ${neighbour.x}, y: ${neighbour.y})`)
            if (neighbour.color == "white") {
                // console.log(`White neighbor: (x: ${neighbour.x}, y: ${neighbour.y})`)
                neighbour.color = "grey"
                neighbour.dist = currentNode.dist + 1
                queue.enqueue(neighbour)
            }
        }
        // console.log(queue.items)
        currentNode.color = "black"
    }
    return visited;

}
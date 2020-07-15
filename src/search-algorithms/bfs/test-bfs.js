// // import bfs from "./bfs"
// // import GridNode from "./GridNode"

// // const bfs = require("./bfs");
// // const GridNode = require("./GridNode");

// const graph = [
//   new GridNode(0, 0),
//   new GridNode(0, 1),
//   new GridNode(0, 2),
//   new GridNode(1, 1),
//   new GridNode(1, 2),
//   new GridNode(2, 1),
//   new GridNode(2, 2),
//   new GridNode(1, 3),
//   new GridNode(3, 1),
//   new GridNode(2, 3),
//   new GridNode(3, 2),
//   new GridNode(3, 3),
// ];

// graph[0].adj.push(graph[1]);
// graph[0].adj.push(graph[2]);

// graph[1].adj.push(graph[3]);
// graph[1].adj.push(graph[4]);

// graph[2].adj.push(graph[4]);
// graph[2].adj.push(graph[5]);
// graph[2].adj.push(graph[6]);

// graph[3].adj.push(graph[7]);

// graph[4].adj.push(graph[8]);
// graph[4].adj.push(graph[9]);

// graph[5].adj.push(graph[10]);

// graph[6].adj.push(graph[11]);

// /*graph[1].adj.push(graph[3]);
// graph[1].adj.push(graph[3]);*/

// // const expectedVisited = [
// //     graph[0],
// //     graph[1],
// //     graph[2],
// //     graph[3],
// //     graph[4],
// //     graph[5],
// //     graph[6],
// //     graph[7],
// //     graph[8],
// //     graph[9],
// //     graph[10],
// //     graph[11],
// // ]

// // for (const neighbor in graph[0].adj) {
// //     console.log(neighbor)
// // }
// // console.log(graph[0])
// // const result = bfs(graph, graph[0]);

// // for (const vertex of result) {
// //   console.log(`(x: ${vertex.x}, y: ${vertex.y})`);
// // }

// module.exports = graph

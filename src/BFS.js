import Queue from '@/Queue.js';


function BFS(graph, s){
    //v is a node in the graph with distance and color
    for (const v in (graph[0])){
        v.color = "white";
        v.dist = 1000;
        //Vertex from which v is encountered
        v.adj = -1;

    }

    const queue = new Queue();
    s.color = "grey";
    s.dist = 0;
    queue.enqueue(v);
    while(!queue.isEmpty()){
        const u = queue.dequeue();
        for (v in v.neighbours){
            //Visit
            if(v.color == "white"){
                v.color = "grey"
                v.dist = u.dist + 1;
                v.adj = u;
                queue.enqueue(v)


            }


        }
        u.color = "black";


    }

}
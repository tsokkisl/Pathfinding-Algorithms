/* Class for a 2D map with obstacles */
class Map {
  constructor(N, S, F, p) {
    this.N = N;
    this.start = S;
    this.finish = F;
    this.p = p;
    this.randomPath = [];
    this.map = this.initializeMap(0);
    this.randomPath = this.generateRandomPath();
    this.addObstacles(this.randomPath, p);
  }

  /* Initialize an empty map */
  initializeMap(e) {
    let map = Array(this.N).fill().map(() => Array(this.N).fill(e));
    for (let i = 0; i < this.N; i++)
      for (let j = 0; j < this.N; j++)
        if (j == 0 || j == this.N - 1 || i == 0 || i == this.N - 1) map[i][j] = 1;
    return map;
  }

  /* Check if point (x, y) exists in a given list */
  checkIfPointExists(arr, val) {
    let flag = false;
    arr.forEach(function(item) {
      if (item[0] == val[0] && item[1] == val[1]) {
        flag = true;
        return flag;
      }
    });
    return flag;
  }

  /* Generate a random path on the map */
  generateRandomPath() {
    let flag = false;
    let path = [this.start];
    let adjacentNodes = [];
    let currentNode = path[0];
    this.map[currentNode[0]][currentNode[1]] = 1;
    while (!flag) {
      adjacentNodes = this.getAdjacentNodes(currentNode);
      if (adjacentNodes.length > 0) {
        if (this.checkIfPointExists(adjacentNodes, this.finish)) {
          flag = true;
          path.unshift(this.finish);
        }
        else {
          currentNode = adjacentNodes[Math.floor(Math.random()*adjacentNodes.length)];
          path.unshift(currentNode);
          this.map[currentNode[0]][currentNode[1]] = 1;
        }
      }
      else {
        path.shift();
        currentNode = path[0]
      }
    }
    this.map = this.initializeMap(0);
    return path;
  }

  /* Return the adjacent nodes of a given node */
  getAdjacentNodes(node) {
    let adjacentNodes = [];
    if (this.map[node[0] - 1][node[1]] == 0) adjacentNodes.push([node[0] - 1, node[1]]);
    if (this.map[node[0] + 1][node[1]] == 0) adjacentNodes.push([node[0] + 1, node[1]]);
    if (this.map[node[0]][node[1] - 1] == 0) adjacentNodes.push([node[0], node[1] - 1]);
    if (this.map[node[0]][node[1] + 1] == 0) adjacentNodes.push([node[0], node[1] + 1]);
    return adjacentNodes;
  }

  /* Add obstacles to the map */
  addObstacles() {
    for (let i = 0; i < this.N; i++)
      for( let j = 0; j < this.N; j++)
        if (!this.checkIfPointExists(this.randomPath, [i, j]))
          if (Math.random() < this.p) this.map[i][j] = 1;
  }

  /* Visualize the map */
  displayMap(path) {
    for (var i = 0; i < this.N; i++) {
      for (var j = 0; j < this.N; j++) {
          var div = document.createElement("div");
          div.style.width = "15px";
          div.style.height = "15px";
          div.style.margin = "0px";
          if (i == this.start[0] && j == this.start[1]) div.style.background = "green";
          else if (i == this.finish[0] && j == this.finish[1]) div.style.background = "red";
          else if (path.length > 0 && this.checkIfPointExists(path, [i, j])) div.style.background = "yellow";
          else if (this.map[i][j] == 1) div.style.background = "black";
          else div.style.background = "white";
          document.getElementById("map").appendChild(div);
      }
      var nl = document.createElement("br");
      document.getElementById("map").appendChild(nl);
    }
  }
}

/* Class for a node of the grid */
class Node {
  constructor(x, y, S, F, i) {
    this.x = x;
    this.y = y;
    this.S = S;
    this.F = F;
    this.distanceFromStart = 0;
    this.parent = null;
    this.f = 0;
    this.h = 0;
    this.id = i;
  }
}

/* Class for the shortest path on the 2D map, between points S and F */
class Pathfinder {
  constructor(S, F, map, c, h) {
    this.S = S;
    this.F = F;
    this.map = map;
    this.cost = c;
    this.heuristic = h;
    this.path = [];
    this.auxMap = this.map.initializeMap(null);
    let k = 0;
    for (var i = 0; i < this.map.N; i++)
      for (var j = 0; j < this.map.N; j++) {
        this.auxMap[i][j] = new Node(i, j, this.S, this.F, k);
        k++;
      }
    this.findPath();
  }

  /* Find the shortest path on the map, between points S and F */
  findPath() {
    let openList = [this.auxMap[this.S[0]][this.S[1]]];
    let closedList = [];

    while (openList.length > 0) {
      openList.forEach(element => element.f = element.distanceFromStart + element.h);
      openList.sort((a, b) => (a.f < b.f) ? 1 : -1);
      let currentNode = openList.pop();
      if (currentNode.x == this.F[0] && currentNode.y == this.F[1]) {
        this.auxMap[currentNode.x][currentNode.y] = currentNode;
        break;
      }
      this.auxMap[currentNode.x][currentNode.y] = currentNode;
      let adjacentNodes = this.map.getAdjacentNodes([currentNode.x, currentNode.y]);
      for (let i in adjacentNodes) {
        let successor_current_cost = currentNode.distanceFromStart + this.cost(currentNode.x, currentNode.y);
        let adj = this.auxMap[adjacentNodes[i][0]][adjacentNodes[i][1]];
        if (openList.map(x => { return x.id; }).indexOf(adj.id) != -1 && adj.distanceFromStart <= successor_current_cost)
          continue;
        else if (closedList.map(x => { return x.id; }).indexOf(adj.id) != -1) {
          if (adj.distanceFromStart <= successor_current_cost)
            continue;
          let index = closedList.map(x => { return x.id; }).indexOf(adj.id);
          closedList.splice(index, 1);
          openList.unshift(adj);
        }
        else {
          adj.h = this.heuristic(adj.x, adj.y, this.F);
          openList.unshift(adj);
        }
        adj.distanceFromStart = successor_current_cost;
        adj.parent = currentNode;
        this.auxMap[adj.x][adj.y] = adj;
      }
      closedList.unshift(currentNode);
    }

    let c = [this.F[0], this.F[1]];
    while (this.auxMap[c[0]][c[1]].parent != null) {
      this.path.unshift([c[0], c[1]]);
      let x = this.auxMap[c[0]][c[1]].parent.x;
      let y = this.auxMap[c[0]][c[1]].parent.y;
      c[0] = x;
      c[1] = y;
    }
    this.path.unshift([this.S[0], this.S[1]]);
  }

  /* Return shortest path */
  getPath() {
    return this.path;
  }
}

/* Heuristic functions */
let calcEuclideanDistance = function (x1, y1, [x2, y2]) {
  return Math.sqrt(Math.abs(x1 - x2) * Math.abs(x1 - x2) + Math.abs(y1 - y2) * Math.abs(y1 - y2));
}

let h0 = function (x1, y1, [x2, y2]) {
  return 0;
}

/* Cost functions */
let cost = function (x1, y1) {
  return 1;
}

let cost0 = function (x1, y1) {
  return 0;
}

/* Initialize map default values */
let map = null;
let N = 0;
let start = [0, 0];
let finish = [0, 0];

/* Generate a map with obstacles */
document.getElementById("generateMap").onclick = function() {
  document.getElementById("map").innerHTML = "";
  document.getElementById("message").innerHTML = "";
  N = parseInt(document.getElementById("N").value);
  start = [parseInt(document.getElementById("startx").value), parseInt(document.getElementById("starty").value)];
  finish = [parseInt(document.getElementById("finishx").value), parseInt(document.getElementById("finishy").value)];
  if (start[0] < 1 || start[1] < 1 || start[0] > N - 2 || start[1] > N - 2) document.getElementById("map").innerHTML = "Start coordinates are out of bounds! x, y must be between 1 and N - 2";
  else if (finish[0] < 1 || finish[1] < 1 || finish[0] > N - 2 || finish[1] > N - 2) document.getElementById("map").innerHTML = "Finish coordinates are out of bounds! x, y must be between 1 and N - 2";
  else  {
    map = new Map(N, start, finish, 0.4);
    map.displayMap([]);
  }
}

/* Find the shortest path on the map, between points S and F, using A* algorithm */
document.getElementById("A*").onclick = function() {
  document.getElementById("map").innerHTML = "";
  document.getElementById("message").innerHTML = "";
  let pathfinder = new Pathfinder(start, finish, map, cost, calcEuclideanDistance);
  map.displayMap(pathfinder.getPath());
  document.getElementById("message").innerHTML = "A* algorithm - Path length : " + pathfinder.getPath().length;
}

/* Find the shortest path on the map, between points S and F, using Dijkstra's algorithm */
document.getElementById("Dijkstra").onclick = function() {
  document.getElementById("map").innerHTML = "";
  document.getElementById("message").innerHTML = "";
  let pathfinder = new Pathfinder(start, finish, map, cost, h0);
  map.displayMap(pathfinder.getPath());
  document.getElementById("message").innerHTML = "Dijkstra's algorithm - Path length : " + pathfinder.getPath().length;
}

/* Find the shortest path on the map, between points S and F, using Best First algorithm */
document.getElementById("BestFirst").onclick = function() {
  document.getElementById("map").innerHTML = "";
  document.getElementById("message").innerHTML = "";
  let pathfinder = new Pathfinder(start, finish, map, cost0, calcEuclideanDistance);
  map.displayMap(pathfinder.getPath());
  document.getElementById("message").innerHTML = "Best First algorithm - Path length : " + pathfinder.getPath().length;
}

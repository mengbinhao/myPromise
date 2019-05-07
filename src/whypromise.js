var boilWater = function() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(`boilWater`);
    }, 5000);
  });
};

var washClass = function() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(`washClass`);
    }, 1000);
  });
};

var steepLeaf = function() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(`steepLeaf`);
    }, 2000);
  });
};

let datas = [];
console.time(`syncPromise`);
boilWater()
  .then(function(data) {
    datas.push(data);
    return washClass(data);
  })
  .then(function(data) {
    datas.push(data);
    return steepLeaf(data);
  })
  .then(function(data) {
    datas.push(data);
    console.log(datas);
    console.log(`Done`);
    console.timeEnd(`syncPromise`);
  });

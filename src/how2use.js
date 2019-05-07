const p = () => {
  return new Promise((resolve, reject) => {
    console.log('start promise');
    resolve('resolve');
    console.log('continue promise');
  });
};

p().then(
  value => {
    console.log('sucess ' + value);
  },
  reson => {
    console.log('error ' + reson);
  }
);

p().then(
  value => {
    console.log('sucess2 ' + value);
  },
  reson => {
    console.log('error2 ' + reson);
  }
);
console.log('end');

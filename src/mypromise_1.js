function MyPromise(executor) {
    const resolve = () => {
    }

    const reject = () => {
    }
    executor(resolve, reject)
}

MyPromise.prototype.then = function(onFullfilled, onRejected) {
}
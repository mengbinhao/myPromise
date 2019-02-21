function MyPromise(executor) {
    this.status = 'pending'

    const resolve = () => {
        this.status = 'resolved'
    }

    const reject = () => {
        this.status = 'rejected'
    }
    executor(resolve, reject)
}

MyPromise.prototype.then = function(onFullfilled, onRejected) {
    if (this.status === 'resolved') {
        onFullfilled()
    }

    if (this.status === 'rejected') {
        onRejected()
    }
}
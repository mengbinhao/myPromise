function MyPromise(executor) {
    this.status = 'pending'

    const resolve = () => {
        if (this.status === 'pending') {
            this.status = 'resolved'
        }
    }

    const reject = () => {
        if (this.status === 'pending') {
            this.status = 'reject'
        }
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
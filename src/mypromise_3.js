function MyPromise(executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
        if (this.status === 'pending') {
            this.value = value
            this.status = 'resolved'
        }
    }

    const reject = (reason) => {
        if (this.status === 'pending') {
            this.reason = reason
            this.status = 'rejected'
        }
    }
    executor(resolve, reject)
}

MyPromise.prototype.then = function(onFullfilled, onRejected) {
    if (this.status === 'resolved') {
        onFullfilled(this.value)
    }

    if (this.status === 'rejected') {
        onRejected(this.reason)
    }
}
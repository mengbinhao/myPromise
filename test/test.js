var promisesAplusTests = require("promises-aplus-tests")
var MyPromise = require("../src/mypromise_8")

MyPromise.deferred = function () {
    let dfd = {}
    dfd.promise = new MyPromise(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    });
    return dfd
}

promisesAplusTests(MyPromise, function (err) {
    // All done; output is in the console. Or check `err` for number of failures.
    console.log(err)
});
## Tests

Tests are good.

    sh siblings.sh
    sh worker.sh
    sh nconf.sh


You will see a bunch of pass messages, but there isn't a way to capture of the "fails" since it's not considered a "fail" if a message is emitting and no one is around to receive it. 

We could implement some sort of "guarantee" in the hook.io API, or even easier is that we might want to keep track of the expected amount of tests that should pass and then if they have not passed after an allotted amount of time, we consider it a fail/
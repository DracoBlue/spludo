new TestSuite("my simple test", {
    testIfEverythingIsFine: function() {
        equal(1, 1);
        equal(2, 2);
        equal(3, 3);
    },
    testIfItIsNotSoFine: function() {
        equal(1, 2);
    }
});

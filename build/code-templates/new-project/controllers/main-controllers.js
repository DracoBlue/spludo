new Controller("", {
    "execute": function(params, context) {
        var that = this;
        return function(cb) {
            context.layout_name = 'HtmlLayout';
            context.view_name = 'Homepage';
            cb();
        };
    }
});

new Controller("shell.hello", {
    "execute": function(params, context) {
        var that = this;
        return function(cb) {
            cb('Hello, back!');
        };
    }
});

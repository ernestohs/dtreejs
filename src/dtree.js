(Case = function (predicate, action) {
    this.predicate = predicate;
    this.action = action;
}).prototype = (function () {
    var doesmatch = function (value) {
        return {
            match: true,
            result: value
        }
    };
    var nomatch = {
        match: false
    };

    var _batch = function (actions, object) {
        var decision;
        var result = nomatch;
        var length = actions.length;

        for (var index = 0; index < length; index++) {
            decision = actions[index];
            if (decision instanceof Case) {
                result = decision.evaluate(object);
                if (result.match) break;
            } else throw ('Array of Case expected');
        }

        return result;
    };

    return {
        evaluate: function (object) {
            var result = nomatch;
            var match = this.predicate;

            if (match instanceof Function) match = match(object);

            if (match) switch (true) {
                case this.action instanceof Function:
                    result = doesmatch(this.action(object));
                    break;
                case this.action instanceof Case:
                    result = this.action.evaluate(object);
                    break;
                case this.action instanceof Array:
                    result = _batch(this.action, object);
                    break;
                default:
                    result = doesmatch(this.action);
                    break;
            }

            return result;
        }
    };
})();

(descitionTree = function () {}).prototype = (function () {

    var buildPredicate = function (object) {
        return new Function(object.arguments, 'return ' + object.condition);
    };

    var resolve = function (action) {
        var result;

        if (action.arguments) result = new Function(action.arguments, 'return ' + action.func);
        else result = new Function('x', 'return ' + action.func + '(x)');

        return result;
    };

    var buildCase = function (model) {
        var action = model.result;
        if (action && action.func) {
            action = resolve(action);
        }

        return new Case(model.func ? buildPredicate(model.func) : true, action);
    };

    var buildModel = function (model) {
        var cases = [];
        var casesModel = model.cases;
        var length = casesModel.length;

        for (var i = 0; i < length; i++) {
            cases.push(buildCase(casesModel[i]));
        };

        return cases;
    }

    return {
        build: function (model) {
            if (typeof model === 'string') {
                model = JSON.parse(model);
            }

            return new Case(true, buildModel(model));
        }
    };
})();


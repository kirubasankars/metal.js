(function (scope) {

    function metal() {
        this._attributes = {};
        this._length = 0;
        this._array = false;

        this._observers = {};
    }

    metal.prototype.trigger = function (key) {
        var observers = this._observers[key];
        if (!observers) return;
        for (idx in observers) {
            var callee = observers[idx];
            callee.cb.call((callee.context || this));
        }
    }

    metal.prototype.on = function (key, cb, context) {
        var allObservers = this._observers,
          observers = this._observers[key];

        if (!observers) {
            allObservers[key] = observers = [];
        }

        var idx = observers.push({
            cb: cb,
            context: context
        });

        return function () {
            allObservers[key] = observers.splice(idx, 1);
            if (allObservers[key].length === 0) {
                delete allObservers[key];
            }
        }
    }

    metal.prototype.set = function (key, value) {
        property_set.call(this, key, value);        
    }

    metal.prototype.contains = function (key) {
        return this._attributes[key] !== undefined;
    }

    metal.prototype.get = function (key) {
        return property_get.call(this, key);
    }

    metal.prototype.toJSON = function () {
        var output = {},
          prop, value;

        for (prop in this._attributes) {
            value = this._attributes[prop];
            if (value instanceof metal) {
                if (value._array === true) {
                    value = value.toJSON();
                } else {
                    value = value._attributes;
                }
            }
            if (this._array) {
                prop = prop.substr(1, prop.length);
            }
            output[prop] = value;
        }

        return output;
    }

    function toJSON() {
        if (this._array) {
            toJSON.call(this)
        }
        return this._attributes;
    }

    function property_get(property) {
        var dot = property.indexOf('.'),
            path, remainingPath;
        if (typeof property === "string" && dot > -1) {
            path = property.substr(0, dot);
            remainingPath = property.substr(dot + 1);

            if (this.contains(path) === true) {
                var child = this.get(path);
                if (child === null) throw path + " is not exists.";
                return child.get(remainingPath);
            }

            if (path === "$parent") {
                if (this._parent._array === true) {
                    return this._parent._parent.get(remainingPath);
                }
                return this._parent.get(remainingPath);
            }

            if (path === "$length") {
                return this._length;
            }

            return null;
        } else {

            if (property === "$parent") {
                if (this._parent._array === true) {
                    return this._parent._parent;
                }
                return this._parent;
            }

            if (property === "$length") {
                return this._length;
            }

            if (this.contains(property) === true) return this._attributes[property];
            return null;
        }
    }

    function property_set(property, value) {
        var dot = property.indexOf('.'),
            path, remainingPath, pathValue;
        if (typeof property === "string" && dot > -1) {
            path = property.substr(0, dot);
            remainingPath = property.substr(dot + 1);
            pathValue = this.get(path);
            if (!pathValue) {
                pathValue = new metal();
                this.set(path, pathValue);
            }
            if (typeof pathValue === "object" && pathValue instanceof metal) {
                pathValue.set(remainingPath, value);
            }
        } else {

            if (property.charAt(0) === '@') {
                path = property.substr(1, property.length - 1);
                if (!isNaN(parseInt(path))) {
                    this._array = true;
                } else {
                    throw "its a array. you try update value with " + localKey;
                }
            }

            if (value instanceof metal) {
                value._parent = this;
            }

            this._attributes[property] = value;
            this._length = this._length + 1;
        }
    }

    scope.metal = metal;

}(window))

(function (scope) {

    function metal() {
        this._attributes = {};
        this._length = 0;
        this._array = false;

        this._observers = {};

        if (arguments && arguments.length > 0) {
            this.set(arguments[0]);
        }
    }

    metal.prototype.set = function () {
        var arg1 = arguments[0], arg2 = arguments[1], prop;

        if (typeof arg1 === "object" || Array.isArray(arg1)) {
            return parseJSON.call(this, arg1)
        }

        property_set.call(this, arg1, arg2)
    }

    function parseJSON(value, property) {
        var a, m = this;
        if (Array.isArray(value)) {
            for (prop in value) {
                a = this.get(property)
                if (!a) {
                    if (property) {
                        m = new metal();
                        this.set(property, m);                        
                    }
                }
                parseJSON.call(m, value[prop], '@' + prop)
            }
        } else if (typeof value === "object") {
            for (prop in value) {
                a = this.get(property)
                if (!a) {
                    if (property) {
                        m = new metal();                        
                        this.set(property, m);
                    }
                }
                parseJSON.call(m, value[prop], prop)
            }
        } else {
            this.set(property, value);
        }
    }

    metal.prototype.get = function (property) {
        if (typeof property === "string") {
            return property_get.call(this, property);
        }
    }

    metal.prototype.has = function (key) {
        return this._attributes[key] !== undefined;
    }

    metal.prototype.property_changed = function () {
        this.trigger.apply(this, arguments);
    }

    metal.prototype.toJSON = function () {
        var output = {},
            prop, value;

        if (this._array) {
            output = [];
        }

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
                //prop = parseInt(prop.substr(1, prop.length));
                output.push(value)
            } else {
                output[prop] = value;
            }
        }

        return output;
    }

    metal.prototype.trigger = function () {
        var key = arguments[0],
            params = Array.prototype.slice.call(arguments, 1);

        var observers = this._observers[key];
        if (!observers) return;

        for (idx in observers) {
            var callee = observers[idx];
            callee.callback.apply((callee.context || this), params);
        }
    }

    metal.prototype.on = function (key, callback, context) {
        var allObservers = this._observers,
            observers = this._observers[key];

        if (!observers) {
            allObservers[key] = observers = [];
        }

        var idx = observers.push({
            callback: callback,
            context: context
        });

        return function () {
            allObservers[key] = observers.splice(idx, 1);
            if (allObservers[key].length === 0) {
                delete allObservers[key];
            }
        }
    }

    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
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
        if (dot > -1) {
            path = property.substr(0, dot);
            remainingPath = property.substr(dot + 1);

            if (this.has(path) === true) {
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

            if (this.has(property) === true) return this._attributes[property];
            return null;
        }
    }

    function property_set(property, value) {
        var dot = property.indexOf('.'),
            path, remainingPath, pathValue;

        if (dot > -1) {
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

            var oldValue = this._attributes[property];
            this._attributes[property] = value;
            this._length = this._length + 1;
            this.property_changed(property, oldValue, value);
        }
    }

    scope.metal = metal;

}(window))

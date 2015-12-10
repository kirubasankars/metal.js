(function(scope) {

  function metal() {
    this._length = 0;
    this._attributes = {};

    this._observers = {};
  }

  metal.prototype.trigger = function(key) {
    var observers = this._observers[key];
    if (!observers) return;
    for (idx in observers) {
      var callee = observers[idx];
      callee.cb.call((callee.context || this));
    }
  }

  metal.prototype.on = function(key, cb, context) {
    var allObservers = this._observers,
      observers = this._observers[key];

    if (!observers) {
      allObservers[key] = observers = [];
    }

    var idx = observers.push({
      cb: cb,
      context: context
    });

    return function() {
      allObservers[key] = observers.splice(idx, 1);
      if (allObservers[key].length === 0) {
        delete allObservers[key];
      }
    }
  }

  metal.prototype.set = function(key, value) {
    property_set.call(this, key, value);
    if (key.indexOf('.') === -1) {
      this._eventBubble(key);
    }
  }

  metal.prototype._eventBubble = function(key) {
    if (this._observers[key]) {
      this.trigger(key);
    }

    if (this._parent) {
      this._parent._eventBubble(this._name + '.' + key);
    }
  }

  metal.prototype.contains = function(key) {
    return this._attributes[key] !== undefined;
  }

  metal.prototype.get = function(key) {
    return property_get.call(this, key);
  }

  metal.prototype.toJSON = function() {
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
      key, remainingKey;
    if (typeof property === "string" && dot > -1) {
      key = property.substr(0, dot);
      remainingKey = property.substr(dot + 1);

      if (this.contains(key) === true) {
        var child = this.get(key);
        if (child === null) throw key + " is not exists.";
        return child.get(remainingKey);
      }

      if (key === "$parent") {
        if (this._parent._array === true) {
          return this._parent._parent.get(remainingKey);
        }
        return this._parent.get(remainingKey);
      }

      if (key === "$length") {
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
      key, remainingKey, localKey, localValue;
    if (typeof property === "string" && dot > -1) {
      key = property.substr(0, dot);
      remainingKey = property.substr(dot + 1);
      if (this.contains(key) === false) {
        if (key.charAt(0) === '@') {
          localKey = key.substr(1, key.length - 1);
          if (!isNaN(parseInt(localKey))) {
            this._array = true;
          }
        }
        this.set(key, new metal());
      }
      localValue = this.get(key);
      if (typeof localValue === "object" && localValue instanceof metal) {
        localValue.set(remainingKey, value);
      }
    } else {
      if (this._array && property.charAt('@') !== "@") {
        throw "its a array. you try update value without index.";
      }
      if (value instanceof metal) {
        value._parent = this;
        value._name = property;
      }

      this._attributes[property] = value;
      this._length = this._length + 1;
    }
  }

  scope.metal = metal;

}(window))

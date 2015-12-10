QUnit.test("set/get", function (assert) {
    var m = new metal();   
    m.set("name", "Test")    
    assert.ok(m.get("name") === "Test", "able to get value back");
    assert.ok(m._attributes.name === "Test", "exists on _attributes");
    assert.ok(m._length === 1, "length got updated");   
});

QUnit.test("set/get level 1", function (assert) {
    var m = new metal();    
    m.set("name.first", "first")
    m.set("name.last", "last")
    var r = (m.get("name.first") === "first") && (m.get("name.last") === "last")    
    assert.ok(m._attributes.name._attributes.first === "first", "exists on _attributes");
    assert.ok(m._attributes.name._attributes.last === "last", "exists on _attributes");
    assert.ok(m._length === 1 && m._attributes.name._length === 2, "length got updated");
    assert.ok(r, "able to get value back");
});


QUnit.test("set/get level 2", function (assert) {
    var m = new metal();    
    m.set("student.name.first", "first")
    m.set("student.name.last", "last")
    var r = m.get("student.name.first") === "first" && m.get("student.name.last") === "last";
    assert.ok(m._length === 1 && m._attributes.student._attributes.name._length === 2, "length got updated");
    assert.ok(m._attributes.student._attributes.name._attributes.first === "first", "exists on _attributes");    
    assert.ok(r, "able to get value back");
});

QUnit.test("array set/get simple value", function (assert) {
    var m = new metal();
    m.set("student.marks.@0", 100)
    m.set("student.marks.@2", 95)
    var r = m.get("student.marks.@0") === 100 && m.get("student.marks.@2") === 95
			&& m._attributes.student._attributes.marks._array;
    assert.ok(r, "able to get value back");
});

QUnit.test("array set/get simple and object value", function (assert) {
    var m = new metal();
    m.set("student.marks.@0", 100)
    m.set("student.marks.@2", 95)
    m.set("student.marks.@3.value", 45)
    assert.ok(m._attributes.student._attributes.marks._attributes['@0'] === 100, "exists on _attributes");
    var r = m.get("student.marks.@0") === 100 && m.get("student.marks.@2") === 95 && m.get("student.marks.@3.value") === 45
    assert.ok(r, "able to get value back");
});

QUnit.test("set/get level 2 return metal", function (assert) {
    var m = new metal();
    m.set("student.name.first", "first")
    var r1 = m.get("student.name") instanceof metal
    var r = m.get("student.name").get('first') === "first" && r1
    assert.ok(r, "returns metal object");
});

QUnit.test("get $length", function (assert) {
    var m = new metal();
    m.set("student.name.first", "first")
    m.set("student.name.last", "last")
    var r = m.get("student.name.$length") === 2
    assert.ok(r, "$length works");
});

QUnit.test("set/get on $parent", function (assert) {
    var m = new metal();
    m.set("student.name.first", "first")
    m.set("student.name.$parent.age", 32)
    assert.ok(m._attributes.student._attributes.age === 32, "exists on _attributes");
    var r = (m.get("student.name.$parent") === m.get("student")) && m.get('student.name.$parent.age') === 32
    assert.ok(r, "$parent works");
});

QUnit.test("exception when array overriding", function (assert) {
    var student = new metal();
    student.set("marks.@0", 100)
    student.set("marks.@1", 80)
    assert.ok(student._attributes.marks._array, "is array");
    assert.throws(function () { student.set("marks.@a", 80) }, "its a array. you try update value without index.");
});

QUnit.test("toJSON", function (assert) {
    var m = new metal();
    m.set("student.name.first", "Test")
    m.set("student.name.last", "Test")
    m.set("student.name.$parent.phone", "99999999")
    m.set("student.marks.@0", 100)
    m.set("student.marks.@2", 95)
    m.set("student.marks.@3.value", 95)
    var v = JSON.stringify(m.toJSON());
    assert.ok(v === '{"student":{"name":{"first":"Test","last":"Test"},"phone":"99999999","marks":[100,95,{"value":95}]}}')
});

QUnit.test("pass initial JSON", function (assert) {
    var m = new metal({ "student": { "name": { "first": "Test", "last": "Test" }, "phone": "99999999", "marks": [100, 95, { "value": 95 }] } });
    var v = JSON.stringify(m.toJSON());    
    assert.ok(m._attributes.student._attributes.phone === "99999999", "exists on _attributes");
    assert.ok(v === '{"student":{"name":{"first":"Test","last":"Test"},"phone":"99999999","marks":[100,95,{"value":95}]}}')    
});

QUnit.test("get/set object", function (assert) {
    var m = new metal();
    m.set({ "student": { "name": { "first": "Test", "last": "Test" }, "phone": "99999999", "marks": [100, 95, { "value": 95 }] } })
    var v = JSON.stringify(m.toJSON());    
    assert.ok(m._attributes.student._attributes.phone === "99999999", "exists on _attributes");
    assert.ok(m._attributes.student._attributes.marks._attributes['@2']._attributes.value === 95, "exists on _attributes");
    assert.ok(v === '{"student":{"name":{"first":"Test","last":"Test"},"phone":"99999999","marks":[100,95,{"value":95}]}}')    
});
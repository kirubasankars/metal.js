QUnit.test( "set/get", function( assert ) {
	var m = new metal();
	m.set("name", "Test")
	assert.ok(m._attributes.name === "Test", "exists on _attributes" );
	assert.ok(m._length === 1, "length got updated" );
	assert.ok(m.get("name") === "Test", "able to get value back" );	
});

QUnit.test( "set/get level 1", function( assert ) {
	var m = new metal();
	m.set("name.first", "first")
	m.set("name.last", "last")
	var r = (m.get("name.first") === "first") && (m.get("name.last") === "last")
	assert.ok(m._length === 1 && m._attributes.name._length === 2, "length got updated" );
	assert.ok(r , "able to get value back" );	
});

QUnit.test( "set/get level 2", function( assert ) {
	var m = new metal();
	m.set("student.name.first", "first")
	m.set("student.name.last", "last")
	var r = m.get("student.name.first") === "first" && m.get("student.name.last") === "last"
	assert.ok(r , "able to get value back" );
});

QUnit.test( "array set/get simple value", function( assert ) {
	var m = new metal();
	m.set("student.marks.@0", 100)
	m.set("student.marks.@2", 95)
	var r = m.get("student.marks.@0") === 100 && m.get("student.marks.@2") === 95
	assert.ok(r , "able to get value back" );
});

QUnit.test( "array set/get simple and object value", function( assert ) {
	var m = new metal();
	m.set("student.marks.@0", 100)
	m.set("student.marks.@2", 95)
	m.set("student.marks.@3.value", 45)
	var r = m.get("student.marks.@0") === 100 && m.get("student.marks.@2") === 95 && m.get("student.marks.@3.value") === 45
	assert.ok(r , "able to get value back" );
});

QUnit.test( "set/get level 2 return metal", function( assert ) {
	var m = new metal();
	m.set("student.name.first", "first")	
	var r1 = m.get("student.name") instanceof metal	
	var r = m.get("student.name").get('first') === "first" && r1
	assert.ok(r , "returns metal object" );
});

QUnit.test( "get $length", function( assert ) {
	var m = new metal();
	m.set("student.name.first", "first")
	m.set("student.name.last", "last")	
	var r = m.get("student.name.$length") === 2
	assert.ok(r , "$length works");
});

QUnit.test( "get $parent", function( assert ) {
	var m = new metal();
	m.set("student.name.first", "first")	
	var r = (m.get("student.name.$parent") === m.get("student"))
	assert.ok(r , "$parent works");
});

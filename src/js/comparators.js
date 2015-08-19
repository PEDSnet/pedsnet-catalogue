var isEqualIdent = function(id1, id2) {
    if (!id1 || !id2) return false;
    return id1.Domain === id2.Domain && id1.Local === id2.Local;
};


// Returns true if the two facts are equal in time entity and time.
var entityTime = function(f1, f2) {
    return isEqualIdent(f1.Entity, f2.Entity) && f1.Time === f2.Time;
};

// Returns true if the twos are equal in time and
var time = function(f1, f2) {
    return f1.Time === f2.Time;
};


module.exports = {
    entityTime: entityTime,
    time: time
};

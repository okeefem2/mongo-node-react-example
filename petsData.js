db.petsData.insertMany(
    [
    {
        "name": "Ollie",
        "color": "Orange",
        "age": 3,
        "hungry": true,
        "type": "Cat"
    },
    {
        "name": "Norman",
        "color": "Black",
        "age": 2,
        "hungry": true,
        "type": "Cat" 
    },
    {
        "name": "Cooper",
        "color": "White",
        "age": 11,
        "hungry": false,
        "type": "Dog"
    },
    {
        "name": "Eleanor",
        "color": "Tiger",
        "age": 1,
        "hungry": false,
        "type": "Cat"
    }
    ]
);

db.humans.insertMany(
    [
    {
        "name": "Michael",
        "age": 24,
    },
    {
        "name": "Kassidy",
        "age": 24,
    },
    {
        "name": "Ryan",
        "age": 32,
    },
    ]
)

db.petsData.updateMany({ type: "Cat"}, {
    $set: { 
        type: {
            description: "Cat",
            family: "Feline",
            hasTail: true
        }
    }
});

db.petsData.updateMany({ type: "Dog"}, {
    $set: { 
        type: {
            description: "Dog",
            family: "Canine",
            hasTail: true
        }
    }
});
// Array 
db.petsData.updateMany({ name: "Cooper"}, {
    $set: { 
        toys: [
            { name: "Panda Pillow Pet" }
        ]
    }
});

// Accessing structured data

db.petsData.findOne({name: "Cooper"}).toys; // Gives the toys array
db.petsData.findOne({toys: {name: "Panda Pillow Pet"}}); // Find by nested object in array

db.petsData.find({"type.family": "Feline"}); // Drilling into embedded doc has to be within "" for dot notation drilling

db.petsData.insertOne(
    {
        "name": "Test",
        "color": "white",
        "age": 35,
        "hungry": true,
        type: {
            description: "Dog",
            family: "Canine",
            hasTail: true
        },
        toys: [
            { name: "Ball", new: true }
        ]
    }
);

db.petsData.deleteOne({toys: {name: "Ball", new: true}});
// Had t match the full doc in the array in order to delete it,
// This is true for all filters on an array 
db.petsData.find({toys: {name: "Ball"}}); // returns nothing

db.petsData.findOne({toys: {name: "Panda Pillow Pet"}})

db.petsData.updateOne({name: "Norman"}, {$inc: {age: 1}, $set: { hungry: false}});

db.petsData.updateOne({name: "Norman"}, {$inc: {age: -1}, $set: { hungry: true}});

db.petsData.updateOne({name: "Cooper"}, {$max: {age: 11}});

// $min changes value IF the value is smaller than the existing, $max does the opposite

//$mul multiplies by the amount specified

db.petsData.updateOne({name: "Cooper"}, {$mul: {age: 2}});

db.petsData.updateOne({name: "Cooper"}, {$mul: {age: 2}});

db.petsData.updateMany({"type.hasTail": true}, {$unset: {hungry: ""}}); // for all that have a tail, remove the hungry field

db.petsData.updateMany({"type.hasTail": true}, {$set: {hungry: true}});

db.petsData.updateMany({}, {$rename: {hungry: "isHungry"}}); // Renames field name to the specified one

// If does not exist, insert, otherwise update -- upsert

db.petsData.updateOne({name: "Bentley"}, {
    $set: {
        age: 8, isHungry: true, color: "White",
        type: {
            description: "Dog",
            family: "Canine",
            hasTail: true
        }
}}, {upsert: true}); 


db.petsData.find({arrayField: {$elemMatch: {field1: value1, field2: value2}}}) // finds where a doc in an array matches both criteria

// To update that matching doc in the array:

db.petsData.updateMany({arrayField: {$elemMatch: {field1: value1, field2: value2}}}, {$set: {"arrayField.$": {field1: newValue}}});
db.petsData.updateMany({arrayField: {$elemMatch: {field1: value1, field2: value2}}}, {$set: {"arrayField.$.field3": value3}});
// The $ refers to the first match of the elem match for the query

// TO update all docs in an array where match occurs
db.petsData.updateMany({}, {
    $set: {
        "arrayField.$[].field2": value2
    }
});

// Update only docs in array where doc matches the arrayFilter specified

db.petsData.updateMany(
    {},
    {
        $set: {
            "arrayField.$[el].field3": value3
        }
    },
    {
        arrayFilters: [
            {"el.field1": {$gt: value1}}
        ]
    }
);

// Adding/removing elements from arrays

db.petsData.updateOne(
    {},
    {
        $push: {
            arrayField: {...doc}
        }
    },
);

db.petsData.updateMany(
    {},
    {
        $push: {
            arrayField: { $each: [{...doc1}, {...doc2}], $sort: { field1: -1}} // can have a sort on the insert, could be useful for enforcing an order on new items
        } // Could also add $slice here to limit what can be added at a time. Could sort, then add only the 1 item, for instance
    },
);

//$pull removes data from array

db.petsData.updateOne(
    {},
    {
        $pull: {
            arrayField: {field1: value1} // pull all docs where criteria matches
        }
    },
);

db.petsData.updateOne(
    {},
    {
        $pop: {
            arrayField: 1 | -1 // 1 removes the last elem, -1 removes the first
        }
    },
);

// $addToSet work similarly to push, however it acts as a set! So if the data is not uniqe, it will not be added again

// replace can be used as a destructive update operation

// deleteOne vs deleteMany, they use the same query selectors as all the other operations
// {$exists: false} checks if a field does not exist -- just as a note

// Delete all entries in a collection: db.collection.drop(); returns true/false if succeeded or not
// db.dropDatabase() removes the db


// Indexes


// If no index, mongo will look at every document in collection 
// to find the query criteria matches. Called a collection scan,.. 

// Creating an index for the key you are looking for creates an ordered list of all the possible values that are in that field
// Every item in the list has a pointer to the document it belongs to 
// This allows for an index scan instead of a collection scan

// The fact that it is an ordered list of all the values makes it much faster to query than the documents (directly comparing with the values instead of finding the doc then comparing)
// Plus the index can be a subset of the collection at times

// Too many indexes can be bad, only put indexes on fields that are often used for queries
// Many indexes slows down write operations because the indexes need to be updated when the values are

// mongoimport persons.json -d contactData -c contacts --jsonArray


db.contacts.explain().find({"dob.age": {$gt: 60}}); // works for find update delete

// winningPlan is how the results are gotten

db.contacts.explain("executionStats").find({"dob.age": {$gt: 60}}); // Gives stats on how fast, how many etc

db.contacts.createIndex({"dob.age": 1}); // 1 asc, -1 desc
db.contacts.dropIndex({"dob.age": 1});
db.contacts.explain("executionStats").find({"dob.age": {$gt: 20}}); // There are no matches for this, so even with the index we will have to go through all documents 

// And actually, the index slows it down, because it has to go through the whole index and all the docs

// Indexes work best for getting a small subset of docs

// Indexes on booleans don't really help, same thing for fields with a small number of possible values (gender, state if all date from a small region)

db.contacts.createIndex({"dob.age": 1, gender: 1}); // Compound index each entry is two combined values with pointer 

// order matters with compound index because defines which kind of 

db.contacts.explain("executionStats").find({"dob.age": {$gt: 35}, gender: "male"});

// Can only use the indexes in order they are show, So a find on just gender will not use the index, but on just age or age and gender, it can use the compound

// Indexes also help with sorting

db.contacts.explain("executionStats").find({"dob.age": {$gt: 35}}).sort({gender: 1});

// Sorting is done in memory, so large collection sorts could cause a timeout

db.contacts.getIndexes();

// Default index is on the _id field asc, this is the default sort order for queries

// Can also add unique indexes!

db.contacts.createIndex({email: 1}, {unique: true}); // WIll error if there are duplicates existing

// Partial filter, if there is a subset of the possible values that will regularly be queried for

db.contacts.createIndex({"dob.age": 1}, {partialFilterExpression: {gender: "male"}}); // only keep docs with gender male in the index

db.contacts.createIndex({"dob.age": 1}, {partialFilterExpression: {"dob.age": {$gt: 60}}}); // only store if age > 60
// difference between partial and compound, partial has less values. Compound has all combos, partial has only where the partial filter is true

db.contacts.createIndex({email: 1}, {unique: true}, {partialFilterExpression: {email: {$exists: true}}});
// ^ Creates unique index on email where email exists. Allows for null

// TTL time to live index -- used to clear data after a certain time

db.contacts.createIndex({createdAt: 1}, {expireAfterSeconds: 10}); // Only works on date objects for single key indexes

// Covered query (where the documents scanned and documents returned as close as possible)
// If an index on a field is created, and the find criteria only asks for the key that is covered 
// by index. Then the value stored in the index can be returned without accessing the document
// This gives a docs examined of 0

// Winning plan:
// 1. Looks for indexes that contain the fields being filtered/ordered
// 2. Creates a race with a winning condition, whichever wins is used.
// The winning plan is cached (for a certain amount of writes, rebuilding index, other indexes are added/removed, server restarted) for future queries that look the same

// Multi key indices

// Index on an array of values is a multi key index. 
// All possible values in the arrays are pulled out into separate indexes


// On an array of documents, a query on a field in the doc in the array will not use the index
// since the value is the whole document. If you want it on the field in the doc, you have to specify that!
// That will be a multi key index
// Multi key indices are performance heavy

//createIndex(field1: "text") creates a text index which stores keywords of the text for easy
// text searching

// Can merge text from multiple fields into a single text index createIndex(field1: "text", field2: "text")
// minus in front of a word in a $search exclude that word
// You can also define the weight for the fields, one could be more important than the other! it is set in the second obj (config) when creating the index

// Building indexes
// foreground: createIndex -- collection is not accessible while building index
// background:  -- collection is accessible while building index
// background: true goes into the config object

// Geospatial!

// lat,long in google maps url
db.places.insertOne({
    name: home,
    location: { // GEO JSON
        type: "Point",
        coordinates: [
            longitude, latitude // Must be this order
        ]

    }
});

// Querying geo spatial data

// First need an index
db.places.createIndex({location: "2dsphere"});


db.places.find({
    location: { $near: {
        $geometry: { // Geojson object
            type: "Point",
            coordinates: [long, lat]
        },
        maxDistance: 300, // Define bounds in meters
        minDistance: 100
    }}
});

// Finding coordinates within a certain area

// p1, p2, p3, p4 each refer to a different point

db.places.find({location: {
    $geoWithin: {
        $geometry: {
            type: "Polygon",
            coordinates: [
                [p1],[p2],[p3],[p4],[p1] // Have to have an ending point
            ]
        }
    }
}});

// Can also store the polygon in the db, and find if a point is within that area\

db.places.find({areaField: {$geoIntersects: {$geometry: ...geoJson}}}) // Does point intersec with the given array

// FInd places in radius around a point

db.places.find({location: 
    {
        $geoWithin: {
            $centerSphere: [
                [long, lat], // center of circle
                radius // In radians
            ] // gives a circle!
        }
    }
})

// near sorts results by how close, geowithin does not sort

// AGGREGATION FRAMEWORK
// Pipeline, each result passed to the next aggregator

db.contacts.aggregate([
    { $match: { gender: 'female'} },
    { 
        $group: { 
            _id: { state: "$location.state" },
            totalPersons: {
                $sum: 1
            } 
        },
    },
    { $sort: {totalPersons: -1 } },
]);

db.persons.aggregate([
    { $match: { gender: 'female'} },
    { 
        $group: { 
            _id: { state: "$location.state" },
            totalPersons: { // Accumulator function value is assigned to this key
                $sum: 1 // For each person grouped by the state field above increment totalPersons by 1
            } 
        },
    }, // Access nested doc location state field
    { $sort: {totalPersons: -1 } }, // sort by the sum of females in the states desc 
]);

db.persons.aggregate([
    { $match: { "dob.age": {$gt: 50}} },
    { 
        $group: { // Define the output documents' structures
            _id: { gender: "$gender" },
            numberPersons: {
                $sum: 1
            },
            avgAge: {
                $avg: "$dob.age" // average age of all people in the pipeline
            } 
        },
    },
    { $sort: {numberPersons: -1 } },
]);

db.contacts.aggregate([
    { $project: { 
            _id: 0,
            gender: 1,
            fullName: {
                $concat: [
                    {
                        $toUpper: {
                            $substrCP: ["$name.title",0,1]
                        }
                    },
                    {$substrCP: ["$name.title",1, { $subtract: [ { $strLenCP: "$name.title"}, 1]}]},
                    " ",
                    {$toUpper: {$substrCP: ["$name.first",0,1]}},
                    {$substrCP: ["$name.first",1, { $subtract: [ { $strLenCP: "$name.first"}, 1]}]},
                    " ", 
                    {$toUpper: {$substrCP: ["$name.last",0,1]}},
                    {$substrCP: ["$name.last",1, { $subtract: [ { $strLenCP: "$name.last"}, 1]}]},
                ]
            }
        } 
    },
]);

db.contacts.aggregate([
    { 
        $project: { 
            _id: 0,
            email: 1,
            location: {
                type: "Point",
                coordinates: [ 
                    { $convert: { input: "$location.coordinates.longitude", to: "double", onError: 0.0, onNull: 0.0} }, // Could use $tDouble here if you wanted, onError/onNull not able to be defined in those cases
                    { $convert: { input: "$location.coordinates.latitude", to: "double", onError: 0.0, onNull: 0.0 } }
                ]
            },
            birthDate: {
                $convert: { input: "$dob.date", to: "date"} // Could also use $toDate if no extra needed
            },
            age: "$dob.age"
        },
    },
    { 
        $group: {
            _id: { 
                birthYear: { $isoWeekYear: "$birthDate"}
            }, // group by the year of birth from project step
            numPersons: {
                $sum: 1
            }
        }
    },
    { $sort: {numPersons: -1}}
]);

// Grouping is n:1 or really n:m right? m being the number of possible groups (more like reduce), project is 1:1 (more like map)


db.contacts.aggregate([
    { 
        $unwind: "$hobbies"
    }, // pull elements out of array, flattens array into multiple copies of the containing doc, each with a different value from the array 1:n op on each document with n being the number of values in the array bewing unwound 
    { 
        $group: {
            _id: { 
                age: "$age"
            },
            allHobbies: {
                $addToSet: "$hobbies" // push w/o dups
            }
        }
    },
]);

db.friends.aggregate([
    {$project: {
        _id:0,
        scores: { 
            $filter: { 
                input: "$examScores",
                as: "sc",
                cond:  { 
                    $gt: [
                        "$$sc.score", // temp var referenced with $$!
                        60
                    ] 
                }
            }
        }
    } }
]);

// NOTE $ is used to refer to the value, otherwise you are referring to the field

// Get the max score of each document
db.contacts.aggregate([
    { 
        $unwind: "$examScores"
    },
    {
        _id: 1,
        name: 1,
        age: 1,
        score: "examScores.score"
    },
    {
        $sort: { score: 1 }
    },
    { 
        $group: {
            _id: "_id",
            name: { $first: "$name" },
            maxScore: {
                $max: $score
            }
        }
    },
    {
        $sort: { maxScore: -1 }
    },
]);


db.contacts.aggregate([
    { 
        $bucket: {
            $groupBy: "$dob.age",
            boundaries: [0, 18, 30, 50, 80, 120],
            output: {
                names: { $push: "$name.first" }, // could do addto set and then get that length also
                averageAge: { $avg: "$dob.age"},
                numPersons: { $sum: 1 }
            }
        }
    },
]);

db.contacts.aggregate([
    { 
        $project: {
            _id: 0,
            name: 1,
            birthDate: { $toDate: "$dob.date"}
        } 
    },
    { 
        $sort: {
            birthDate: 1
        } 
    },
    { 
        $skip: 10 
    },
    { 
        $limit: 10
    },
]);

// { $out: "collectionName" } to add to a collection or create a new collection with the data if it doesn't exist

// When using higher precision/value numbers (Long, 128bit decimal), construct the numbers as strings.
// We need to do this because if you do NumberDecimal(0.3) the 0.3 is treated as a normal float first which is not precise. So do 
// NumberDecimal("0.3")

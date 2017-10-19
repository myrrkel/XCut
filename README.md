# XCut
Bar Cutting Optimizer with Node.js

From a collection of pieces to cut in bars of a given length, generate an optimized cutting plan.

-Collections are provided in json files. 
To generate an example on https://www.json-generator.com/ use this model:

[
  '{{repeat(1000, 7)}}',
  {
    length: '{{integer(400, 3500)}}',
    packingId: function (tags) {
      var ids = ['A265', 'A249', 'A317', 'A322', 'B781', 'B796'];
      return ids[tags.integer(0, ids.length - 1)];
    }
  }
]


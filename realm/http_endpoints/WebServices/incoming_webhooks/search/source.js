// This function is the webhook's request handler.
exports = function(payload, response) {

    // Set default search term if nothing in payload
    var searchTerm = (payload.query.search && (payload.query.search.length> 0)) ? searchTerm = payload.query.search : "crestor";
    
    // Paste in Aggregation pipeline here as const
    const pipeline = [
  {
    '$search': {
      'text': {
        'query': searchTerm, 
        'path': {
          'wildcard': '*'
        },
        "synonyms": "synonyms"
      }
    }
  }, {
      '$project': {
          'title': 1, 
          'prescription': 1, 
          'healthProvider': 1, 
          'score': {
              '$meta': 'searchScore'
          }, 
          'highlight': {
              '$meta': 'searchHighlights'
          }
      }
    }, {
        '$limit': 10
    }
];
    // Return the aggregation pipeline results
    return context.services.get("mongodb-atlas").db("HealthMonitoringDB").collection("patients").aggregate(pipeline).toArray();
};
exports = function(payload) {
 const collection = context.services.get("mongodb-atlas").db("HealthMonitoringDB").collection("patients");
      let arg = payload.query.arg;
      console.log(arg);

  return collection.aggregate([
    {
        '$search': {
            'index': 'default', 
            'text': {
                'query': arg, 
                'path': 'prescription', 
                'synonyms': 'synonyms'
            }, 
            'highlight': {
                'path': 'prescription'
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
]).toArray();
};

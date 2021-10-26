  /*
    Accessing application's values:
    var x = context.values.get("value_name");

    Accessing a mongodb service:
    var collection = context.services.get("mongodb-atlas").db("dbname").collection("coll_name");
    collection.findOne({ owner_id: context.user.id }).then((doc) => {
      // do something with doc
    });

    To call other named functions:
    var result = context.functions.execute("function_name", arg1, arg2);

    Try running in the console below.
  */


exports = function(changeEvent) {
const collection = context.services.get("mongodb-atlas").db("HealthMonitoringDB").collection("bloodPressureTS");
    const aggpipe = [
  {
    '$setWindowFields': {
      'partitionBy': '$device_id', 
      'sortBy': {
        'timestamp': 1
      }, 
      'output': {
        'AverageHeartRate': {
          '$avg': '$heart_rate', 
          'window': {
            'range': [
              -4, 'current'
            ], 
            'unit': 'minute'
          }
        }, 
        'AverageSystolicPressure': {
          '$avg': '$systolic_pressure', 
          'window': {
            'range': [
              -4, 'current'
            ], 
            'unit': 'minute'
          }
        }, 
        'AverageDiastolicPressure': {
          '$avg': '$diastolic_pressure', 
          'window': {
            'range': [
              -4, 'current'
            ], 
            'unit': 'minute'
          }
        }
      }
    }
  }, {
    '$project': {
      'timestamp': 1, 
      'device_id': 1, 
      'AverageHeartRate': 1, 
      'AverageDiastolicPressure': 1, 
      'AverageSystolicPressure': 1
    }
  }, {
    '$sort': {
      'timestamp': -1
    }
  }, {
    '$group': {
      '_id': '$device_id', 
      'latest_avg_hr': {
        '$first': '$AverageHeartRate'
      }, 
      'latest_avg_dbp': {
        '$first': '$AverageDiastolicPressure'
      }, 
      'latest_avg_sbp': {
        '$first': '$AverageSystolicPressure'
      }
    }
  }, {
    '$lookup': {
      'from': 'patients', 
      'localField': '_id', 
      'foreignField': 'device_id', 
      'as': 'string',
      //'pipeline': [ { $project: { name: 1 ,_id:0} }]
    }
  }, {
    '$unwind': {
      'path': '$string'
    }
  }, {
    '$project': {
      'timestamp': 1, 
      'device_id': 1, 
      'latest_avg_hr': 1, 
      'latest_avg_dbp': 1, 
      'latest_avg_sbp': 1, 
      'name': '$string.name', 
      'prescription': '$string.prescription'
    }
  }
];
    return collection.aggregate(aggpipe,{allowDiskUse:true}).toArray()
  .then(devices => {
    for(const device of devices) {
      
      if (device.latest_avg_hr > 160){
      var scbs = ['sodium channel blocker', 'tambocor', 'flecainide', 'propafenone', 'rythmol', 'lidocaine', 'mexiletine', 'tocainide', 'phenytoin'];
      var scb_bool = scbs.includes(device.prescription.toLowerCase());

      var message_string = `OMG a patient with device ID ${device._id} might be having a heart attack. Stop everything and call your patient.`
      if (typeof scb_bool !== 'undefined' && !scb_bool) {
        message_string += ` Additionally, you may want to prescribe a Sodium Channel Blocker since they are currently prescribed ${device.prescription}`
      }
      context.functions.execute("SendSMS", message_string);
      }
    }
    return devices
  })
  .catch(err => console.error(`Failed to group events by devices: ${err}`))
  
};

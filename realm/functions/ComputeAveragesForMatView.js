exports = function(changeEvent) {
const collection = context.services.get("t3").db("HealthMonitoringDB").collection("bloodPressureTS");
    const aggpipe = [
        {
          $setWindowFields: {
            partitionBy: '$device_id',
            sortBy: {
              timestamp: 1
            },
            output: {
              AverageHeartRate: {
                $avg: '$heart_rate',
                window: {
                  range: [-4, 'current'],
                  unit: 'minute'
                }
              },
              AverageSystolicPressure: {
                $avg: '$systolic_pressure',
                window: {
                  range: [-4, 'current'],
                  unit: 'minute'
                }
              },
              AverageDiastolicPressure: {
                $avg: '$diastolic_pressure',
                window: {
                  range: [-4, 'current'],
                  unit: 'minute'
                }
              }
            }
          }
        },
        {
          // $merge: { into: "avg_out", on: "_id", whenMatched: "replace", whenNotMatched: "insert" }
          $out:"avg_out"
        }
      ];
    const doc = collection.aggregate(aggpipe);
    return doc;
};

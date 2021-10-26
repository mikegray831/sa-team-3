import random
import settings
from pymongo import MongoClient
import time
import datetime
from timeit import default_timer as timer

####
# Start script
####
startTs = time.gmtime()
start = timer()
print("==============================================")
print("== Generating Blood Pressure Telemetry Data ==")
print("==============================================")
print("\nStarting " + time.strftime("%Y-%m-%d %H:%M:%S", startTs) + "\n")


####
# Main start function
####
def main():
    print('Generating time series for num devices: ' + str(NUM_DEVICES))

    two_hour_ago = datetime.datetime.now() + datetime.timedelta(hours=2)
    bp_date = two_hour_ago + datetime.timedelta(minutes=1)

    mdb_connection = get_database_connection()

    while True:
        device_ids = (1, 2, 3, 4, 5, 6, 7, 8, 9)
        device_index = random.choice(device_ids)
        print('Generating measurement for device ' + str(device_index))
        bpm = get_bp_measurement(device_index, bp_date)
        mdb_connection.insert_one(bpm)
        bp_date = bp_date + datetime.timedelta(minutes=1)

        # Random selection of data generating out of threshold event
        # For at least 10 minutes, elevated heart rate and blood pressure
        high_bp_event = random.randint(1, 10)
        if high_bp_event == 3:
            print('*** HIGH BLOOD PRESSURE EVENT ***')
            for _ in range(int(10)):
                print('High Blood Pressure for device: ' + str(device_index))
                high_bpm = get_high_bp_measurement(device_index, bp_date)
                mdb_connection.insert_one(high_bpm)
                bp_date = bp_date + datetime.timedelta(minutes=1)


####
#
####
def get_database_connection():
    print('Initialize database.')
    mongo_client = MongoClient(MDB_CONNECTION)
    database = mongo_client[MDB_DATABASE]
    bp_collection = database[MDB_COLLECTION]

    print('Drop Existing Collection.')
    bp_collection.drop()

    print('Create TimeSeries Collection.')
    # expire docs after 4 hours
    database.create_collection(MDB_COLLECTION, timeseries={'timeField': 'timestamp', 'granularity': 'minutes',
                                                           'metaField': 'device_id'}, expireAfterSeconds=14400)

    return bp_collection


####
#
####
def get_bp_measurement(device_id, timestamp):
    blood_pressure_measurement = {
        'device_id': device_id,
        'heart_rate': random.randint(50, 200),
        'systolic_pressure': random.randint(105, 175),
        'diastolic_pressure': random.randint(70, 130),
        'temperature': random.randint(90, 105),
        'timestamp': timestamp
    }

    return blood_pressure_measurement


####
#
####
def get_high_bp_measurement(device_id, timestamp):
    blood_pressure_measurement = {
        'device_id': device_id,
        'heart_rate': random.randint(100, 200),
        'systolic_pressure': random.randint(180, 200),
        'diastolic_pressure': random.randint(120, 150),
        'temperature': random.randint(100, 105),
        'timestamp': timestamp
    }

    return blood_pressure_measurement


####
# Constants loaded from .env file
####
MDB_CONNECTION = settings.MDB_CONNECTION
MDB_DATABASE = settings.MDB_DATABASE
MDB_COLLECTION = settings.MDB_COLLECTION
NUM_DEVICES = settings.NUM_DEVICES

####
# Main
####
if __name__ == '__main__':
    main()

####
# Indicate end of script
####
end = timer()
endTs = time.gmtime()
total_time = end - start

print("\nEnding " + time.strftime("%Y-%m-%d %H:%M:%S", endTs))
print('===============================')
if total_time > 60:
    print('Total Time Elapsed (in minutes): ' + str(total_time / 60))
else:
    print('Total Time Elapsed (in seconds): ' + str(total_time))

# sa-team-3 (Team Manc)

### Team Members
* Mike Grayson
* Suraj Shetty
* Dhananjay Ghevde
* Danish Malik
* Nati Yemane
* Blaine Mincey

# Require Capablities for Hackathon
* Timeseries 
* CSFLE
* Window function
* Triggers
* Realm 
  * Hosting
  * Functions
  * Thirdparty Endpoint
  * Services :Twilio
* Atlas Search 
  * Synonyms
* Realtime Analytics
 * Meterialized Views
* Atlas Charts


# Real-Time Blood Pressure Monitoring

## Pre-requisites
### Patient Data w/ Client-side Field Level Encryption (Java Application)
* Data Generation Tools are in datagenerators sub-directory

* Rename patientData/src/main/resources/env.example to .env

* Modify values in .env to match your MongoDB connection and mongocryptd path

* Run the main method of securitykeys/CreateMasterKeyFile to generate the master key

* Run the main method of PatientCSFLE

* Result - 10 patients with name/ssn encrypted

### Blood Pressure Telemetry Data for time-series (Python3 Application)
* Data Generation Tools are in datagenerators sub-directory

* Rename bpMonitoringData/env.example to .env

* Install requirements via ```pip3 install -r requirements.txt```

* Run generate_blood_pressure.py

* Result - Random blood pressure time-series data generated for 10 separate devices at 1 minute intervals (while true so kill this when completed)


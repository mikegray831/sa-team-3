package org.mongodb.healthmonitoring;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import org.mongodb.healthmonitoring.model.PatientDocument;
import org.mongodb.healthmonitoring.utils.CSFLEHelpers;
import io.github.cdimascio.dotenv.Dotenv;
import org.bson.Document;

public class PatientCSFLE {

    // MongoDB variables
    private String mongodbConnection;
    private String database;
    private String collection;

    // Variables related to client-side field-level encryption
    private String keyDb;
    private String keyCollection;
    private String kmsProvider;
    private String keyAltName;
    private String masterKeyFile;
    private byte[] masterKeyBytes;
    private String encryptionKey;
    private String mongocryptdPath;

    // Helper class with majority of encryption methods
    CSFLEHelpers helper = new CSFLEHelpers();


    /**
     *
     */
    public PatientCSFLE() {
        this.initialize();
    }

    /**
     *
     */
    private void initialize() {
        System.out.println("Initialize from .env properties");

        // load .env properties
        Dotenv dotenv = Dotenv.configure().load();

        // MongoDB Variables
        this.mongodbConnection = dotenv.get("CONNECTION");
        this.database = dotenv.get("DATABASE");
        this.collection = dotenv.get("COLLECTION");

        // CSFLE Variables from .env
        this.keyDb = dotenv.get("KEY_DB");
        this.keyCollection = dotenv.get("KEY_COLLECTION");
        this.kmsProvider = dotenv.get("KMS_PROVIDER");
        this.keyAltName = dotenv.get("KEY_ALT_NAME");
        this.masterKeyFile = dotenv.get("MASTER_KEY_FILE");
        this.mongocryptdPath = dotenv.get("MONGO_CRYPTD_PATH");

        // Init encryption key
        this.initEncryptionKey();

        // verify encryption key to continue
        if(this.encryptionKey == null || this.encryptionKey.length() < 1) {
            System.err.println("Improper Encryption Key.  Halting.");
            System.err.println("Encryption Key: " + this.encryptionKey);
        } else {
            System.out.println("Encryption Key set.  Continue.");

            // Run Encrypted Client
            this.encryptedClient();

        }
    }

    /**
     *
     */
    private void initEncryptionKey() {
        System.out.println("=== Initialize Encrypted Key ===");
        try {
            System.out.println("Read master key file");
            this.masterKeyBytes = helper.readMasterKey(this.masterKeyFile);

        } catch (Exception e) {
            System.err.println("Exception reading master key: " + e);
        }

        System.out.println("Find data encryption key");
        this.encryptionKey = CSFLEHelpers.findDataEncryptionKey(  this.mongodbConnection,
                                                                    this.keyAltName,
                                                                    this.keyDb,
                                                                    this.keyCollection);

        if (this.encryptionKey == null && masterKeyBytes.length > 0) {
            // No key found; create index on key vault and a new encryption key and print the key
            CSFLEHelpers.createKeyVaultIndex(this.mongodbConnection, this.keyDb, this.keyCollection);
            String keyVaultCollection = String.join(".", this.keyDb, this.keyCollection);
            this.encryptionKey = CSFLEHelpers.createDataEncryptionKey(  this.mongodbConnection,
                                                                        this.kmsProvider,
                                                                        this.masterKeyBytes,
                                                                        keyVaultCollection,
                                                                        keyAltName);

            System.out.println("Created new encryption key: " + this.encryptionKey);
        } else {
            // Print the key
            System.out.println("Found existing encryption key: " + this.encryptionKey);
        }
    }

    /**
     *
     */
    private void encryptedClient() {
        try {
            System.out.println("\n=== Encrypted Client ===");

            String keyVaultCollection = String.join(".", this.keyDb, this.keyCollection);

            Document schema = CSFLEHelpers.createJSONSchema(this.encryptionKey);

            MongoClient encryptedClient = CSFLEHelpers.createEncryptedClient(
                    this.mongodbConnection,
                    this.kmsProvider,
                    this.masterKeyBytes,
                    keyVaultCollection,
                    schema,
                    this.mongocryptdPath,
                    this.database,
                    this.collection);

            MongoCollection<PatientDocument> encryptedCollection =
                    encryptedClient.getDatabase(this.database).getCollection(this.collection,PatientDocument.class);

            for(int idx = 0; idx < 10; idx++) {
                PatientDocument patientDocument = new PatientDocument();
                patientDocument.setDevice_id(idx);

                encryptedCollection.insertOne(patientDocument);
            }

            encryptedClient.close();

        } catch (Exception e) {
            System.err.println(e);
        }
    }


    /**
     *
     * @param args
     */
    public static void main(String[] args) {
        new PatientCSFLE();
    }
}

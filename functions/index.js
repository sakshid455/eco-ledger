/**
 * @fileOverview Eco Ledger - Network Background Services
 * 
 * This file implements server-side logic for the network:
 * 1. Automated Audit Logging: Ensures every critical write is recorded.
 * 2. Notification Dispatch: Alerts nodes of state changes (approvals, settlements).
 * 3. Preference-Aware Email Simulation: Checks user settings before "sending" alerts.
 */

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

// Configuration for institutional performance
setGlobalOptions({ 
  region: "us-central1",
  maxInstances: 10 
});

/**
 * Triggers on land registration to log the initial state.
 */
exports.logLandRegistration = onDocumentCreated("lands/{landId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();
  const db = admin.firestore();

  console.log(`[Network] Node registered new asset: ${data.name}`);

  // Create an automated audit entry
  await db.collection("auditLogs").add({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    eventType: "SYSTEM_LAND_INGESTION",
    entityId: event.params.landId,
    details: "Automated server-side verification initialized."
  });
});

/**
 * Triggers on land status updates (e.g., from PENDING to APPROVED).
 * Dispatches notifications and simulates email delivery based on user preferences.
 */
exports.notifyLandVerification = onDocumentUpdated("lands/{landId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.status === after.status) return;

  const db = admin.firestore();
  const landId = event.params.landId;
  console.log(`[Network] Asset ${landId} state transition: ${before.status} -> ${after.status}`);

  // 1. Dispatch in-app notification
  await db.collection("notifications").add({
    userId: after.ownerId,
    title: "Asset Status Update",
    message: `Your land parcel '${after.name}' has been transitioned to ${after.status}.`,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: "PROTOCOL_ALERT"
  });

  // 2. Simulated Email Dispatch Protocol
  // Fetch user profile to check preferences
  const userDoc = await db.collection("users").doc(after.ownerId).get();
  if (userDoc.exists) {
    const userData = userDoc.data();
    const prefs = userData.preferences || {};
    
    if (prefs.emailNotifications) {
      console.log(`[Email Service] DISPATCHING REAL-TIME ALERT to: ${userData.email}`);
      console.log(`[Email Service] SUBJECT: Asset ${after.status} - Eco Ledger Network`);
      console.log(`[Email Service] BODY: Your ecological asset ${after.name} has been verified on the ledger.`);
      
      /**
       * NOTE FOR PRODUCTION:
       * Here is where we would integrate a real SMTP client or SendGrid API call.
       * e.g., await sendGrid.send({ to: userData.email, ... });
       */
    } else {
      console.log(`[Email Service] SUPPRESSED: User ${after.ownerId} has disabled email alerts.`);
    }
  }
});

/**
 * Triggers on transaction settlement to monitor network liquidity.
 */
exports.onTransactionSettled = onDocumentCreated("transactions/{txId}", async (event) => {
  const tx = event.data.data();
  console.log(`[Ledger] Settlement finalized: ${tx.id} for ${tx.amount} units`);
  
  // Aggregation logic for network-wide impact metrics would go here.
});

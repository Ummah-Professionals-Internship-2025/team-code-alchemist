const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.approveUser = functions.https.onCall(async (data, context) => {
  const email = data.email;

  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email is required.");
  }

  try {
    const pendingRef = db.collection("mentors").doc(email);
    const approvedRef = db.collection("approved").doc(email);

    const docSnap = await pendingRef.get();

    if (!docSnap.exists) {
      throw new functions.https.HttpsError("not-found", "User not found in mentors.");
    }

    const userData = docSnap.data();

    // Optionally add approval metadata
    userData.approvedAt = admin.firestore.FieldValue.serverTimestamp();

    await approvedRef.set(userData);
    await pendingRef.delete();

    return { success: true, message: `${email} approved. `};
  } catch (error) {
    console.error("Approval error:", error);
    throw new functions.https.HttpsError("internal", "Something went wrong.");
  }
});
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.approveUser = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new functions.https.HttpsError("unknown", "User creation failed", error);
  }
});

import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // Ensure requesting user exists in Stream before issuing token
    try {
      await upsertStreamUser({
        id: req.user._id.toString(),
        name: req.user.fullName,
        image: req.user.profilePic || "",
      });
    } catch (error) {
      console.log("Error upserting Stream user when generating token:", error);
    }

    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

import { StreamChat } from "stream-chat";
import { getStreamToken } from "./api";

let clientInstance = null;

export async function getOrCreateStreamClient(authUser, apiKey) {
  if (!authUser || !apiKey) return null;
  if (clientInstance && clientInstance?.userID === authUser._id) return clientInstance;

  const tokenData = await getStreamToken();
  if (!tokenData?.token) return null;

  const client = StreamChat.getInstance(apiKey);
  if (client.userID && client.userID !== authUser._id) {
    await client.disconnectUser();
  }

  await client.connectUser(
    { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
    tokenData.token
  );

  clientInstance = client;
  return clientInstance;
}

export async function disconnectStreamClient() {
  if (clientInstance) {
    await clientInstance.disconnectUser();
    clientInstance = null;
  }
}



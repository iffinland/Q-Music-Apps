/* global qortalRequest */

const publishAudio = async (file, metadata, currentUser, imageFile) => {
  try {
    if (!currentUser?.name) {
      throw new Error('User not logged in');
    }

    if (typeof qortalRequest === 'undefined') {
      throw new Error('This app must be run in the Qortal UI to publish content');
    }

    // Create a guaranteed unique identifier using a timestamp. This is the most reliable way.
    const timestamp = Date.now();
    const cleanTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const cleanName = currentUser.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const identifier = `qmusic_track_${cleanName}_${cleanTitle}_${timestamp}`;

    // Prepare resources array for publishing
    const resources = [
      {
        name: currentUser.name, // User name stays same
        service: "AUDIO",
        identifier, // Unique identifier for each song
        title: metadata.title,
        description: `artist=${metadata.artist}`,
        file: file,
        filename: file.name
      }
    ];

    // Add thumbnail if provided
    if (imageFile) {
      resources.push({
        name: currentUser.name,
        service: "THUMBNAIL",
        identifier, // Same identifier as audio
        file: imageFile,
        filename: `${cleanTitle}.${imageFile.name.split('.').pop()}`
      });
    }

    // Publish using Qortal API
    const result = await qortalRequest({
      action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
      resources
    });

    console.log("Publish result:", result);

    // Check if result is an array of transaction objects (successful case)
    if (Array.isArray(result) && result.length > 0 && result[0].signature) {
      return { success: true, identifier, transactions: result };
    }

    // If result is exactly true (also successful)
    if (result === true) {
      return { success: true, identifier };
    }

    // Otherwise consider it an error
    throw new Error("Unexpected API response: " + JSON.stringify(result));
  } catch (error) {
    console.error('Error publishing audio:', error);
    throw error;
  }
};

export { publishAudio };

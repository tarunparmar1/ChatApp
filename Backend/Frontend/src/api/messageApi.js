import axios from 'axios';

/**
 * Delete a chat message.
 * @param {string} messageId - MongoDB _id of the message.
 * @param {'forMe'|'forEveryone'} type - Deletion type.
 * @returns {Promise<any>} Server response.
 */
export const deleteMessage = async (messageId, type) => {
  const { data } = await axios.delete(`/api/message/deleteMessage/${messageId}`, {
    data: { deleteType: type },
    withCredentials: true,
  });
  return data;
};

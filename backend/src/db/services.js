import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { getAvatarColor } from '../utils/avatar.js';

export function formatUser(doc) {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : doc;
  return {
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
    createdAt: u.createdAt,
    lastSeen: u.lastSeen,
  };
}

function formatMember(doc) {
  if (!doc?.userId) return null;
  const u = doc.userId;
  return {
    id: u._id.toString(),
    username: u.username,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
    lastSeen: u.lastSeen,
  };
}

function getMessageStatus(message, currentUserId, memberCount) {
  if (message.deletedAt) return 'deleted';
  if (message.userId._id?.toString() !== currentUserId && message.userId?.toString() !== currentUserId) {
    return null;
  }

  const readCount = message.readBy?.filter(
    (r) => r.userId.toString() !== currentUserId
  ).length || 0;
  const deliveredCount = message.deliveredTo?.filter(
    (id) => id.toString() !== currentUserId
  ).length || 0;
  const others = Math.max(memberCount - 1, 1);

  if (readCount >= others) return 'read';
  if (deliveredCount > 0 || readCount > 0) return 'delivered';
  return 'sent';
}

export function formatMessage(doc, currentUserId, memberCount = 2) {
  if (!doc) return null;
  const m = doc.toObject ? doc.toObject() : doc;
  const user = m.userId;

  return {
    id: m._id.toString(),
    roomId: m.conversationId.toString(),
    conversationId: m.conversationId.toString(),
    userId: user._id?.toString() || user.toString(),
    username: user.username,
    displayName: user.displayName,
    avatarColor: user.avatarColor,
    content: m.deletedAt ? null : m.content,
    type: m.type,
    imageUrl: m.deletedAt ? null : m.imageUrl,
    replyTo: m.replyTo?._id?.toString() || m.replyTo?.toString() || null,
    replyContent: m.replyTo?.content || null,
    replyUsername: m.replyTo?.userId?.username || null,
    editedAt: m.editedAt,
    deletedAt: m.deletedAt,
    createdAt: m.createdAt,
    status: getMessageStatus(m, currentUserId, memberCount),
    readBy: m.readBy?.map((r) => r.userId.toString()) || [],
    deliveredTo: m.deliveredTo?.map((id) => id.toString()) || [],
  };
}

async function populateConversation(conv, userId) {
  if (!conv) return null;
  const c = conv.toObject ? conv.toObject() : conv;
  const members = await getConversationMembers(c._id.toString());

  const lastMsg = await Message.findOne({
    conversationId: c._id,
    deletedAt: null,
  }).sort({ createdAt: -1 }).lean();

  const memberEntry = c.members?.find((m) => m.userId.toString() === userId);
  const unread = await Message.countDocuments({
    conversationId: c._id,
    userId: { $ne: userId },
    deletedAt: null,
    createdAt: { $gt: memberEntry?.lastReadAt || new Date(0) },
  });

  let displayName = c.name;
  let avatarColor = c.avatarColor;

  if (c.type === 'private') {
    const other = members.find((m) => m.id !== userId);
    if (other) {
      displayName = other.displayName;
      avatarColor = other.avatarColor;
    }
  }

  return {
    id: c._id.toString(),
    name: c.name,
    displayName,
    type: c.type === 'private' ? 'dm' : c.type,
    description: c.description,
    createdBy: c.createdBy?.toString(),
    createdAt: c.createdAt,
    avatarColor,
    lastMessage: lastMsg?.type === 'image' ? '📷 Photo' : lastMsg?.content || null,
    lastMessageAt: lastMsg?.createdAt || null,
    unreadCount: unread,
    memberCount: members.length,
    members,
  };
}

// ─── Users ───

export async function createUser({ username, email, passwordHash, displayName }) {
  const user = await User.create({
    username,
    email,
    passwordHash,
    displayName: displayName || username,
    avatarColor: getAvatarColor(username),
  });
  return formatUser(user);
}

export async function getUserById(id) {
  const user = await User.findById(id);
  return formatUser(user);
}

export async function getUserByUsername(username) {
  return User.findOne({ username: username.toLowerCase() });
}

export async function getUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

export async function updateLastSeen(userId) {
  await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
}

export async function searchUsers(query, excludeUserId, limit = 20) {
  const users = await User.find({
    _id: { $ne: excludeUserId },
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } },
    ],
  }).limit(limit).lean();

  return users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
    lastSeen: u.lastSeen,
  }));
}

export async function getAllUsers(excludeUserId) {
  const users = await User.find({ _id: { $ne: excludeUserId } })
    .sort({ displayName: 1 })
    .lean();

  return users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
    lastSeen: u.lastSeen,
  }));
}

// ─── Conversations ───

export async function createConversation({ name, type, description, createdBy, memberIds = [] }) {
  const uniqueMembers = [...new Set([createdBy, ...memberIds].filter(Boolean))];
  const members = uniqueMembers.map((id) => ({ userId: id, joinedAt: new Date() }));

  const conv = await Conversation.create({
    name,
    type,
    description,
    createdBy,
    members,
    avatarColor: type === 'group' ? getAvatarColor(name || 'group') : undefined,
  });

  return populateConversation(conv, createdBy);
}

export async function getOrCreatePrivateChat(userId1, userId2) {
  const existing = await Conversation.findOne({
    type: 'private',
    'members.userId': { $all: [userId1, userId2] },
    $expr: { $eq: [{ $size: '$members' }, 2] },
  });

  if (existing) return populateConversation(existing, userId1);

  return createConversation({
    name: null,
    type: 'private',
    createdBy: userId1,
    memberIds: [userId2],
  });
}

export async function createGroupChat({ name, description, createdBy, memberIds }) {
  if (!memberIds?.length) {
    throw new Error('Group must have at least one other member');
  }
  return createConversation({
    name,
    type: 'group',
    description,
    createdBy,
    memberIds,
  });
}

export async function getConversationById(conversationId, userId) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) return null;

  const isMember = conv.members.some((m) => m.userId.toString() === userId);
  if (!isMember) return null;

  return populateConversation(conv, userId);
}

export async function getUserConversations(userId) {
  const convs = await Conversation.find({ 'members.userId': userId }).sort({ updatedAt: -1 });
  const populated = await Promise.all(convs.map((c) => populateConversation(c, userId)));

  return populated
    .filter(Boolean)
    .sort((a, b) => {
      const aT = a.lastMessageAt || a.createdAt;
      const bT = b.lastMessageAt || b.createdAt;
      return new Date(bT) - new Date(aT);
    });
}

export async function getConversationMembers(conversationId) {
  const conv = await Conversation.findById(conversationId).populate('members.userId');
  if (!conv) return [];

  return conv.members
    .map((m) => formatMember(m))
    .filter(Boolean)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function isConversationMember(conversationId, userId) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) return false;
  return conv.members.some((m) => m.userId.toString() === userId);
}

// Aliases for existing route names
export const getUserRooms = getUserConversations;
export const getRoomById = getConversationById;
export const getRoomMembers = getConversationMembers;
export const isRoomMember = isConversationMember;
export const getOrCreateDmRoom = getOrCreatePrivateChat;
export const createRoom = (data) => createGroupChat({ ...data, memberIds: data.memberIds || [] });

export async function joinPublicRoom() {
  return null;
}

// ─── Messages ───

export async function getConversationMessages(conversationId, userId, limit = 100, before = null) {
  const query = { conversationId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const conv = await Conversation.findById(conversationId);
  const memberCount = conv?.members?.length || 2;

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username displayName avatarColor')
    .populate({
      path: 'replyTo',
      populate: { path: 'userId', select: 'username' },
    })
    .lean();

  return messages.reverse().map((m) => formatMessage(m, userId, memberCount));
}

export const getRoomMessages = getConversationMessages;

export async function getMessageById(messageId, userId) {
  const msg = await Message.findById(messageId)
    .populate('userId', 'username displayName avatarColor')
    .populate({ path: 'replyTo', populate: { path: 'userId', select: 'username' } });

  if (!msg) return null;
  const conv = await Conversation.findById(msg.conversationId);
  return formatMessage(msg, userId, conv?.members?.length || 2);
}

export async function createMessage({ conversationId, roomId, userId, content, type = 'text', imageUrl = null, replyTo = null }) {
  const convId = conversationId || roomId;

  const message = await Message.create({
    conversationId: convId,
    userId,
    content,
    type,
    imageUrl,
    replyTo,
    deliveredTo: [userId],
    readBy: [{ userId, readAt: new Date() }],
  });

  await Conversation.findByIdAndUpdate(convId, { updatedAt: new Date() });

  return getMessageById(message._id, userId);
}

export async function markMessageDelivered(messageId, userId) {
  const msg = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deliveredTo: userId } },
    { new: true }
  );
  return msg;
}

export async function editMessage(messageId, userId, content) {
  const msg = await Message.findOne({ _id: messageId, userId, deletedAt: null });
  if (!msg) return null;

  const age = Date.now() - new Date(msg.createdAt).getTime();
  if (age > 15 * 60 * 1000) return null;

  msg.content = content;
  msg.editedAt = new Date();
  await msg.save();

  return getMessageById(messageId, userId);
}

export async function deleteMessage(messageId, userId) {
  const msg = await Message.findOne({ _id: messageId, userId, deletedAt: null });
  if (!msg) return null;

  msg.deletedAt = new Date();
  msg.content = '';
  await msg.save();

  return getMessageById(messageId, userId);
}

export async function markMessagesAsRead(conversationId, userId, upToMessageId = null) {
  await Conversation.updateOne(
    { _id: conversationId, 'members.userId': userId },
    { $set: { 'members.$.lastReadAt': new Date() } }
  );

  let query = {
    conversationId,
    userId: { $ne: userId },
    deletedAt: null,
  };

  if (upToMessageId) {
    const target = await Message.findById(upToMessageId);
    if (target) query.createdAt = { $lte: target.createdAt };
  }

  const messages = await Message.find(query);
  const readIds = [];

  for (const msg of messages) {
    const alreadyRead = msg.readBy.some((r) => r.userId.toString() === userId);
    if (!alreadyRead) {
      msg.readBy.push({ userId, readAt: new Date() });
      if (!msg.deliveredTo.some((id) => id.toString() === userId)) {
        msg.deliveredTo.push(userId);
      }
      await msg.save();
      readIds.push(msg._id.toString());
    }
  }

  return readIds;
}

export async function searchMessages(userId, query, limit = 50) {
  const convs = await Conversation.find({ 'members.userId': userId }).select('_id name type');
  const convIds = convs.map((c) => c._id);

  const messages = await Message.find({
    conversationId: { $in: convIds },
    content: { $regex: query, $options: 'i' },
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'displayName')
    .lean();

  return messages.map((m) => {
    const conv = convs.find((c) => c._id.toString() === m.conversationId.toString());
    return {
      id: m._id.toString(),
      roomId: m.conversationId.toString(),
      content: m.content,
      createdAt: m.createdAt,
      displayName: m.userId.displayName,
      roomName: conv?.name,
      roomType: conv?.type === 'private' ? 'dm' : conv?.type,
    };
  });
}

export async function getUnreadCount(userId) {
  const convs = await Conversation.find({ 'members.userId': userId });
  let total = 0;
  for (const conv of convs) {
    const member = conv.members.find((m) => m.userId.toString() === userId);
    const count = await Message.countDocuments({
      conversationId: conv._id,
      userId: { $ne: userId },
      deletedAt: null,
      createdAt: { $gt: member?.lastReadAt || new Date(0) },
    });
    total += count;
  }
  return total;
}

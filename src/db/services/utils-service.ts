import { isValidObjectId } from 'mongoose';
import { Group, IGroup } from '../schemas/Group';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';

export async function isMemberOfTheGroup(userId: string, groupId: string): Promise<Boolean> {
	try {
		if (!isValidObjectId(userId) || !isValidObjectId(groupId)) return false;
		const result = await Group.findById(groupId).lean();
		if (!result) return false;
		const group: IGroup = result;
		if (group.members !== undefined) {
			const member = group.members.find((member) => member._id === userId);
			if (!member) return false;
			return true;
		}
		return false;
	} catch (err) {
		throw err;
	}
}

export async function isLeaderOfTheGroup(userId: string, groupId: string) {
	try {
		if (!isValidObjectId(userId) || !isValidObjectId(groupId)) return false;
		const result = await Group.findById(groupId);
		if (!result) return false;
		if (result.leaderId !== userId) return false;
		return true;
	} catch (err) {
		throw err;
	}
}

export async function areUsersInviteThemseft(userId: String, invitedUserCode: string): Promise<Boolean> {
	try {
		const inviterInfo = await AnonymousUser.findById(userId).lean();
		if (!inviterInfo) return false;
		const inviter: IAnonymousUser = inviterInfo;
		if (inviter.userCode === invitedUserCode) return false;
		return true;
	} catch (err) {
		throw err;
	}
}

export async function isUserInvited(userId: string, invitationId: string): Promise<Boolean> {
	try {
		const user = await AnonymousUser.findOne({ _id: userId, invitationIds: invitationId });
		if (!user) return false;
		return true;
	} catch (err) {
		throw err;
	}
}

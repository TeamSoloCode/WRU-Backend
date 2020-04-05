import { Group, IMember } from '../schemas/Group';
import { isAnonymousExists } from './isUserExists';
import { IResultType } from './service-result-type';
import { addAnonymousUserGroups } from './anonymous-user';
import { isValidObjectId } from 'mongoose';

export const createNewGroup = async (leaderId: string): Promise<IResultType> => {
	try {
		if (!(await isAnonymousExists(leaderId))) return { err: true, message: 'User is not exists !!' };
		const newGroup = new Group();
		newGroup.leaderId = leaderId;
		const newMember: IMember = { _id: leaderId, enableShowLocation: true };
		newGroup.members?.push(newMember);
		await newGroup.save();
		const result = await addAnonymousUserGroups(leaderId, newGroup._id);
		if (result.err) return { err: true, message: result.message };
		return { err: false, data: newGroup._id };
	} catch (err) {
		return { err: true, message: err };
	}
};

export async function addNewUserIntoTheGroup(addedUserId: string, groupId: string): Promise<IResultType> {
	try {
		if (!isValidObjectId(addedUserId)) return { err: true, message: 'Invalid user id !!' };
		if (!isValidObjectId(groupId)) return { err: true, message: 'Invalid group id !!' };
		const groupInfo = await Group.findById(groupId);
		if (!groupInfo) return { err: true, message: 'Group is not exist' };
		if (groupInfo.members) groupInfo.members.push({ _id: addedUserId, enableShowLocation: true });
		await groupInfo.save();
		return { err: false, message: 'Add user into group successful !!' };
	} catch (err) {
		throw err;
	}
}

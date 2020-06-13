import { Group, IMember, IGroup } from '../schemas/Group';
import { isAnonymousExists } from './isUserExists';
import { IResultType } from './service-result-type';
import { addAnonymousUserGroups } from './anonymous-user';
import { isValidObjectId, ClientSession } from 'mongoose';
import { isLeaderOfTheGroup } from './utils-service';
import { db } from '../../index';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';

export const createNewGroup = async (leaderId: string, name: string): Promise<IResultType> => {
	try {
		if (!(await isAnonymousExists(leaderId))) return { err: true, message: 'User is not exists !!' };
		const newGroup = new Group();
		newGroup.leaderId = leaderId;
		const newMember: IMember = { _id: leaderId, enableShowLocation: true };
		newGroup.members?.push(newMember);
		newGroup.name = name;
		await newGroup.save();
		const result = await addAnonymousUserGroups(leaderId, newGroup._id);
		if (result.err) return { err: true, message: result.message };
		return { err: false, data: newGroup._id, message: `Create new group ${name} successful !!` };
	} catch (err) {
		return { err: true, message: err };
	}
};

export async function addNewUserIntoTheGroup(
	addedUserId: string,
	groupId: string,
	session: ClientSession | null = null
): Promise<IResultType> {
	try {
		if (!isValidObjectId(addedUserId)) return { err: true, message: 'Invalid user id !!' };
		if (!isValidObjectId(groupId)) return { err: true, message: 'Invalid group id !!' };
		const groupInfo = await Group.findById(groupId);
		if (!groupInfo) return { err: true, message: 'Group is not exist' };
		if (groupInfo.members) groupInfo.members.push({ _id: addedUserId, enableShowLocation: true });
		if (session) {
			await groupInfo.save({ session });
		} else {
			await groupInfo.save();
		}
		return { err: false, message: 'Add user into group successful !!' };
	} catch (err) {
		throw err;
	}
}

export async function deleteAnonymousGroup(userId: string, groupId: string): Promise<IResultType> {
	const session = await db.startSession();
	session.startTransaction();

	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id !!' };
		if (!isValidObjectId(groupId)) return { err: true, message: 'Invalid group id !!' };
		if (!(await isLeaderOfTheGroup(userId, groupId))) return { err: true, message: 'You are not leader of this group' };
		const groupInfo = await Group.findById(groupId).lean() as IGroup;
		if (!groupInfo) return { err: true, message: 'Group is not exist !' };
		const group: IGroup = groupInfo;
		const findMemberPromises: any = [];
		group.members?.map((member) => findMemberPromises.push(AnonymousUser.findById(member._id)));
		const memberInfo = await Promise.all<IAnonymousUser>(findMemberPromises);

		const updateGroupIdPromises: any[] = [];
		memberInfo.map((info) => {
			if (info.groupIds) {
				const newGroupIds = info.groupIds?.filter((id) => id != groupId);
				info.groupIds = newGroupIds;
				updateGroupIdPromises.push(info.save({ session: session }));
			}
		});
		await Promise.all(updateGroupIdPromises);
		await Group.findByIdAndDelete(groupId, { session: session });
		session.commitTransaction();
		return { err: false, message: `Group ${group.name} was deleted !` };
	} catch (err) {
		if (session) {
			session.abortTransaction();
			session.endSession();
		}
		throw err;
	}
}

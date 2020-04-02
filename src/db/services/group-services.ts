import { Group, IMember } from '../schemas/Group';
import { isAnonymousExists } from './isUserExists';
import { IResultType } from './service-result-type';
import { addAnonymousUserGroups } from './anonymous-user';

export const createNewGroup = async (leaderId: string): Promise<IResultType> => {
	try {
		if (!isAnonymousExists(leaderId)) return { err: true, message: 'User is not exists !!' };
		const newGroup = new Group();
		newGroup.leaderId = leaderId;
		const newMember: IMember = { _id: leaderId, enableShowLocation: true };
		newGroup.members?.push(newMember);
		await newGroup.save();
		await addAnonymousUserGroups(leaderId, newGroup._id);
		return { err: false, data: newGroup._id };
	} catch (err) {
		return { err: true, message: err };
	}
};

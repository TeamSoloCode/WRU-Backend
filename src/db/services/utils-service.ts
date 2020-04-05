import { isValidObjectId } from 'mongoose';
import { Group, IGroups } from '../schemas/Group';

export const isMemberOfTheGroup = async (userId: string, groupId: string): Promise<Boolean> => {
	try {
		if (!isValidObjectId(userId) || !isValidObjectId(groupId)) return false;
		const result = await Group.findById(groupId).lean();
		if (!result) return false;
		const group: IGroups = result;
		if (group.members !== undefined) {
			const member = group.members.find((member) => member._id === userId);
			if (!member) return false;
			return true;
		}
		return false;
	} catch (err) {
		throw err;
	}
};

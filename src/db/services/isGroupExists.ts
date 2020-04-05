import { isValidObjectId } from 'mongoose';
import { Group } from '../schemas/Group';

export const isGroupExists = async (groupId: string): Promise<Boolean> => {
	if (!isValidObjectId(groupId)) return false;
	const result = await Group.findById(groupId).lean();
	if (!result) return false;
	return true;
};

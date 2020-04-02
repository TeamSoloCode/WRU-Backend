import { isValidObjectId, Types } from 'mongoose';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';
import { IResultType } from './service-result-type';

export const createAnonymousUser = async (userInfo: IAnonymousUser): Promise<IResultType> => {
	try {
		const { name, latitude, longitude, imageUrl } = userInfo;
		const user = new AnonymousUser();

		user.name = name;
		user.latitude = latitude;
		user.longitude = longitude;
		user.imageUrl = imageUrl;

		await user.save();
		return { err: false, message: 'Create use successful!!!', data: user._id };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const getAnonymousGroupMembers = async (userId: string, groupId: string): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		const isUserInTheGroup = await AnonymousUser.findOne({
			_id: Types.ObjectId(userId),
			groupId: groupId
		});

		const result = isUserInTheGroup
			? { err: false, data: await AnonymousUser.find({ groupId: groupId }) }
			: { err: false, data: [] };
		return result;
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const updateAnonymousUserLocation = async (
	userId: string,
	latitude: number,
	longitude: number
): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		await AnonymousUser.updateOne({ _id: Types.ObjectId(userId) }, { latitude, longitude });
		return { err: false, message: 'Update location successful' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const addAnonymousUserGroups = async (userId: string, groupId: string): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		if (!isValidObjectId(groupId)) return { err: true, message: 'Invalid group id' };
		const user = await AnonymousUser.findById(userId);
		if (user) {
			user.groupIds?.push(groupId);
			await user.save();
			return { err: false, message: 'Add new group successful !!!' };
		}
		return { err: false, message: 'User is not exits !' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

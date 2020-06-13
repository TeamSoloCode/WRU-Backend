import { isValidObjectId } from 'mongoose';
import { AnonymousUser, IAnonymousUser } from '../schemas/AnonymousUser';
import { IResultType } from './service-result-type';
import { Group, IGroup } from '../schemas/Group';
import shortid from 'shortid';
import { IGetAnonymousGroupMemberResponse } from '../../apis/response-type';

export const createAnonymousUser = async (userInfo: IAnonymousUser): Promise<IResultType> => {
	try {
		const { name, email, password, latitude, longitude, imageUrl } = userInfo;
		const user = new AnonymousUser();

		user.name = name;
		user.email = email;
		user.password = password;
		user.latitude = latitude;
		user.longitude = longitude;
		user.imageUrl = imageUrl;
		user.userCode = shortid.generate();

		await user.save();
		return { err: false, message: 'Create use successful!!!', data: user._id };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export async function loginWithAnonymousAccount(email: string, password: string) {
	try {
		const user = await AnonymousUser.findOne({ email, password }).lean();
		if (!user) return { err: false, message: 'User is not exist !!' };
		return { err: false, message: 'Login successful!!!', data: user._id };
	} catch (err) {
		return { err: true, message: err.message };
	}
}

export async function getAnonymousUserInfomation(userId: string  | string[] | QueryString.ParsedQs | QueryString.ParsedQs[] | undefined): Promise<IResultType> {
	try {
		const userInfo = await AnonymousUser.findById(userId).lean();
		if (!userInfo) return { err: true, message: 'User is not exist !' };
		const { userCode, imageUrl, name } = userInfo;
		return { err: false, data: { userCode, imageUrl, name } };
	} catch (err) {
		return { err: true, message: err.message };
	}
}

export const getAnonymousGroupMembers = async (userId: string, groupId: string): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };
		const isUserInTheGroup = await AnonymousUser.findOne({
			_id: userId,
			groupIds: groupId,
		}).lean();

		if (isUserInTheGroup) {
			const groupInfo = (await Group.findById(groupId).lean()) as IGroup;
			if (!groupInfo) return { err: false, data: [] };

			const getMemberPromises: any = [];
			groupInfo.members?.map((member) => getMemberPromises.push(AnonymousUser.findById(member._id).lean()));

			const memberInfo = await Promise.all<IAnonymousUser>(getMemberPromises);
			const result: IGetAnonymousGroupMemberResponse[] = [];
			memberInfo.map((member: IAnonymousUser) => {
				const existMember = groupInfo.members?.find(({ _id }) => _id == member._id);
				if (existMember) {
					result.push({
						enableShowLocation: existMember.enableShowLocation,
						_id: member._id,
						name: member.name,
						imageUrl: member.imageUrl,
					});
				}
			});

			return { err: false, data: result };
		}
		return { err: true, message: 'You are not in the group' };
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
		await AnonymousUser.updateOne({ _id: userId }, { latitude, longitude });
		return { err: false, message: 'Update location successful' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const getAnonymousUserByCode = async (userCode: string): Promise<IResultType> => {
	try {
		const user = await AnonymousUser.findOne({ userCode });
		if (!user) return { err: false, message: 'User is not exists !' };
		return { err: false, data: user };
	} catch (err) {
		return { err: true, message: err };
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
		return { err: true, message: 'User is not exists !' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const addUserNewInvitation = async (userCode: string, invitationId: string): Promise<IResultType> => {
	try {
		const findUserResult = await getAnonymousUserByCode(userCode);
		if (findUserResult.err) return { err: true, message: findUserResult.message };
		const user: IAnonymousUser = findUserResult.data;
		user.invitationIds?.push(invitationId);
		await user.save();
		return { err: false, message: 'Update user invitaions successful !!' };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

export const getAnonymousUserGroup = async (userId: string): Promise<IResultType> => {
	try {
		if (!isValidObjectId(userId)) return { err: true, message: 'Invalid user id' };

		const getGroupsResult = await AnonymousUser.findById(userId).lean();
		if (!getGroupsResult) return { err: true, message: 'User is not exist !' };
		const getGroupPromises: any = [];
		getGroupsResult.groupIds?.map((id: string) => getGroupPromises.push(Group.findById(id).lean()));

		return { err: false, data: await Promise.all(getGroupPromises) };
	} catch (err) {
		return { err: true, message: err.message };
	}
};

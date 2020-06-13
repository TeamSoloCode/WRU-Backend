import express, { Request, Response } from 'express';
import {
	getAnonymousGroupMembers,
	createAnonymousUser,
	updateAnonymousUserLocation,
	getAnonymousUserInfomation,
	getAnonymousUserGroup,
	loginWithAnonymousAccount,
} from '../db/services/anonymous-user';
import { responseData } from './response-type';
import { AnonymousUser, IAnonymousUser } from '../db/schemas/AnonymousUser';
import { SUCCESSFUL, FAILURE } from '../constants/response-code';

const router = express.Router();

router.get('/GetAnonymousGroupMembers', async (req, res) => {
	const { userId, groupId } = req.query;

	if(typeof userId == 'string'  && typeof groupId == 'string')
		{
			const result = await getAnonymousGroupMembers(userId, groupId);
			if (result.err) res.status(200).json(responseData(FAILURE, result));
			res.status(200).json(responseData(SUCCESSFUL, result));
		}
		else{
			res.status(200).json(responseData(FAILURE, {
				err: true,
				message: 'Error: userId and groupId must be a string',
				data: null
			}));
		}


});

router.post('/CreateAnonymousUser', async (req: Request, res: Response) => {
	const { name, email, password, latitude, longitude, imageUrl }: IAnonymousUser = req.body;
	let userInfo = new AnonymousUser();

	userInfo.name = name;
	userInfo.email = email;
	userInfo.password = password;
	userInfo.latitude = latitude;
	userInfo.longitude = longitude;
	userInfo.imageUrl = imageUrl;

	const result = await createAnonymousUser(userInfo);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

router.post('/LoginWithAnonymousAccount', async (req: Request, res: Response) => {
	const { email, password } = req.body;
	const result = await loginWithAnonymousAccount(email, password);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

router.post('/UpdateLocation', async (req: Request, res: Response) => {
	const { userId, latitude, longitude } = req.body;
	const result = await updateAnonymousUserLocation(userId, latitude, longitude);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

router.get('/GetAnonymousUserInfomation', async (req: Request, res: Response) => {
	const { userId } = req.query;
	if(typeof userId == 'string')
	{	
		const result = await getAnonymousUserInfomation(userId);
		if (result.err) 
			res.status(200).json(responseData(FAILURE, result));
		res.status(200).json(responseData(SUCCESSFUL, result));
	}
	else
	{
		res.status(200).json(responseData(FAILURE, {
			err: true,
			message: "Error: userId must be a string",
			data: null
		}))
	}
});

router.get('/GetAnonymousUserGroups', async (req: Request, res: Response) => {
	const { userId } = req.query;
	
	
	if(typeof userId == 'string')
	{	
		const result = await getAnonymousUserGroup(userId);
		if (result.err) 
			res.status(200).json(responseData(FAILURE, result));
		res.status(200).json(responseData(SUCCESSFUL, result));
	}
	else
	{
		res.status(200).json(responseData(FAILURE, {
			err: true,
			message: "Error: userId must be a string",
			data: null
		}))
	}
});

export default router;

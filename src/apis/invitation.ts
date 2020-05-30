import express, { Request, Response } from 'express';
import {
	createAnonymousUserInvitation,
	answerInvitation,
	getGetUserInvitation,
} from '../db/services/invitation-service';
import { responseData } from './response-type';
import { SUCCESSFUL, FAILURE } from '../constants/response-code';

const router = express.Router();

router.post('/CreateNewInvitation', async (req: Request, res: Response) => {
	const { inviterId, invitedUserCode, groupId, message } = req.body;
	const result = await createAnonymousUserInvitation(inviterId, invitedUserCode, groupId, message);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

router.post('/AnswerInvitation', async (req: Request, res: Response) => {
	const { invitationId, status, userId } = req.body;
	const result = await answerInvitation(invitationId, userId, status);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

router.get('/GetUserInvitations', async (req: Request, res: Response) => {
	const { userId } = req.query;
	const result = await getGetUserInvitation(userId);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

export const InvitaionAPIs = router;

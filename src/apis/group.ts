import express, { Request, Response } from 'express';
import { createNewGroup, deleteAnonymousGroup } from '../db/services/group-services';
import { responseData } from './response-type';
import { SUCCESSFUL, FAILURE } from '../constants/response-code';

const router = express.Router();

router.post('/CreateGroup', async (req: Request, res: Response) => {
	const { leaderId, name } = req.body;
	const result = await createNewGroup(leaderId, name);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

router.delete('/DeleteAnonymousGroup', async (req: Request, res: Response) => {
	const { userId, groupId } = req.body;
	const result = await deleteAnonymousGroup(userId, groupId);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

export const GroupAPIs = router;

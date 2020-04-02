import express, { Request, Response } from 'express';
import { createNewGroup } from '../db/services/group-services';
import { responseData } from './response-type';
import { SUCCESSFUL, FAILURE } from '../constants/response-code';

const router = express.Router();

router.post('/CreateGroup', async (req: Request, res: Response) => {
	const { leaderId } = req.body;
	const result = await createNewGroup(leaderId);
	if (result.err) res.status(200).json(responseData(FAILURE, result));
	res.status(200).json(responseData(SUCCESSFUL, result));
});

export const GroupAPIs = router;

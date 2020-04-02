import { Schema, Document, Model, model } from 'mongoose';

export interface IGroups extends Document {
	leaderId: string;
	members?: [IMember];
}

export interface IMember {
	_id: string;
	enableShowLocation: boolean;
}

const members = new Schema({
	_id: { type: String, required: true, maxlength: 24 },
	enableShowLocation: { type: Boolean, default: true }
});

const group = new Schema({
	leaderId: { type: String, required: true, maxlength: 24 },
	members: { type: [members], maxlength: 10, default: [] }
});

export const Group: Model<IGroups> = model<IGroups>('Group', group, 'Groups');

import { Schema, Document, Model, model } from 'mongoose';

export interface IGroup extends Document {
	leaderId: string;
	members?: [IMember];
	name: string;
	createTime: number;
}

export interface IMember {
	_id: string;
	enableShowLocation: boolean;
}

const members = new Schema({
	_id: { type: String, required: true, maxlength: 24 },
	enableShowLocation: { type: Boolean, default: true },
});

const group = new Schema({
	leaderId: { type: String, required: true, maxlength: 24 },
	name: { type: String, required: true, max: 255 },
	members: { type: [members], maxlength: 10, default: [] },
	createTime: { type: Number, default: new Date().getTime() },
});

export const Group: Model<IGroup> = model<IGroup>('Group', group, 'Groups');
